import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TaskItem.module.css';

function TaskItem({ 
    task, 
    level = 0, 
    isExpanded, 
    expandedTasks,  // 👈 ДОБАВИТЬ: передаём Set с развёрнутыми задачами
    onToggle, 
    onComplete, 
    onDelete, 
    onFocus 
}) {
    const navigate = useNavigate();
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    
    return (
        <div style={{ marginLeft: `${level * 20}px`, marginBottom: '8px' }}>
            <div className={styles.taskItem}>
                <div className={styles.taskContent}>
                    {hasSubtasks && (
                        <button
                            onClick={() => onToggle(task.id)}
                            className={styles.expandButton}
                            title={isExpanded ? 'Свернуть подзадачи' : 'Развернуть подзадачи'}
                        >
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    )}
                    {!hasSubtasks && <span className={styles.expandPlaceholder} />}

                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onComplete(task.id)}
                        className={styles.checkbox}
                    />
                    <div className={styles.taskInfo}>
                        <span className={styles.taskTitle} style={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? '#888' : '#333'
                        }}>
                            {task.title}
                        </span>
                        {task.tags_detail && task.tags_detail.length > 0 && (
                            <div className={styles.tagsContainer}>
                                {task.tags_detail.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={styles.tag}
                                        style={{
                                            backgroundColor: tag.color + '20',
                                            borderLeft: `3px solid ${tag.color}`,
                                        }}
                                    >
                                        🏷️ {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        {task.assigned_people_detail && task.assigned_people_detail.length > 0 && (
                            <div className={styles.peopleTags}>
                                {task.assigned_people_detail.map(person => (
                                    <span key={person.id} className={styles.personTag}>
                                        👤 {person.first_name} {person.last_name || ''}
                                    </span>
                                ))}
                            </div>
                        )}
                        {task.place_detail && (
                            <div className={styles.placeInfo}>
                                📍 {task.place_detail.name}
                                {task.place_detail.address && <span> ({task.place_detail.address})</span>}
                            </div>
                        )}
                        {task.resources_detail && task.resources_detail.length > 0 && (
                            <div className={styles.resourcesContainer}>
                                {task.resources_detail.map(resource => (
                                    <span key={resource.id} className={styles.resourceTag}>
                                        {resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {task.scheduled_end && (
                        <span className={styles.deadline}>
                            📅 {new Date(task.scheduled_end).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <div className={styles.actions}>
                    <button
                        onClick={() => onFocus(task.id)}
                        className={styles.focusButton}
                        title="Показать только эту задачу с подзадачами"
                    >
                        🔍
                    </button>
                    <button
                        onClick={() => {
                            const focusedId = task.parent_task || null;
                            navigate(`/tasks/edit/${task.id}`, { 
                                state: { focusedTaskId: focusedId } 
                            });
                        }}
                        className={styles.editButton}
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className={styles.deleteButton}
                    >
                        🗑️
                    </button>
                </div>
            </div>
            {hasSubtasks && isExpanded && (
                <div className={styles.subtasksContainer}>
                    {task.subtasks.map(subtask => (
                        <TaskItem
                            key={subtask.id}
                            task={subtask}
                            level={level + 1}
                            isExpanded={expandedTasks.has(subtask.id)}  // 👈 ИСПРАВЛЕНО
                            expandedTasks={expandedTasks}              // 👈 ДОБАВЛЕНО
                            onToggle={onToggle}
                            onComplete={onComplete}
                            onDelete={onDelete}
                            onFocus={onFocus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default TaskItem;