import { tagService } from '../services/tagService';
import TagForm from '../components/common/TagForm';

export const tagConfig = {
    service: tagService,
    FormComponent: TagForm,
    config: {
        title: 'Теги',
        icon: '🏷️',
        entityName: 'тег',
        initialFormData: {
            name: '',
            color: '#6c757d',
        },
        renderItem: (tag, isSelected) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                    display: 'inline-block', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: tag.color 
                }} />
                <span>{tag.name}</span>
                {isSelected && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓</span>}
            </div>
        ),
    },
};