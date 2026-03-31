from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Task

@receiver(m2m_changed, sender=Task.assigned_people.through)
def propagate_people_to_parents(sender, instance, action, reverse, model, pk_set, **kwargs):
    """
    При добавлении участника к задаче, автоматически добавляем его ко всем родительским задачам
    """
    # Только при добавлении участников (не при удалении)
    if action != 'post_add':
        return
    
    # Получаем добавленных участников
    added_people = list(model.objects.filter(pk__in=pk_set))
    
    if not added_people:
        return
    
    # Рекурсивно поднимаемся по родителям
    def add_to_parents(task, people_to_add):
        if not task.parent_task:
            return
        
        parent = task.parent_task
        # Добавляем участников к родителю
        for person in people_to_add:
            if not parent.assigned_people.filter(id=person.id).exists():
                parent.assigned_people.add(person)
        
        # Продолжаем вверх по иерархии
        add_to_parents(parent, people_to_add)
    
    add_to_parents(instance, added_people)