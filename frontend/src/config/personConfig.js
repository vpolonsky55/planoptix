import { personService } from '../services/personService';
import PersonForm from '../components/common/PersonForm';

export const personConfig = {
    service: personService,
    FormComponent: PersonForm,
    config: {
        title: 'Контакты',
        icon: '👥',
        entityName: 'контакт',
        initialFormData: {
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            notes: '',
        },
        renderItem: (person, isSelected) => (
            <>
                <strong>{person.first_name} {person.last_name || ''}</strong>
                {person.phone && <span style={{ fontSize: '0.85rem', color: '#666' }}>📞 {person.phone}</span>}
                {person.email && <span style={{ fontSize: '0.85rem', color: '#666' }}>✉️ {person.email}</span>}
                {isSelected && <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '0.5rem' }}>✓</span>}
            </>
        ),
    },
};