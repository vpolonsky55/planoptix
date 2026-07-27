import { resourceService } from '../services/resourceService';
import ResourceForm from '../components/common/ResourceForm'; 

export const resourceConfig = {
    service: resourceService,
    FormComponent: ResourceForm,
    config: {
        title: 'Ресурсы',
        icon: '📎',
        entityName: 'ресурс',
        initialFormData: {
            name: '',
            description: '',
            resource_type: 'link',
            url: '',
            file: null,
        },
        renderItem: (resource, isSelected) => (
            <>
                <strong>
                    {resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}
                </strong>
                {resource.description && (
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>📝 {resource.description}</span>
                )}
                {resource.resource_type === 'link' && resource.url && (
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>🔗 {resource.url}</span>
                )}
                {isSelected && <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '0.5rem' }}>✓</span>}
            </>
        ),
    },
};