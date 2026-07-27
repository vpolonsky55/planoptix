import { placeService } from '../services/placeService';
import PlaceForm from '../components/common/PlaceForm';

export const placeConfig = {
    service: placeService,
    FormComponent: PlaceForm,
    config: {
        title: 'Места',
        icon: '📍',
        entityName: 'место',
        initialFormData: {
            name: '',
            address: '',
            notes: '',
        },
        renderItem: (place, isSelected) => (
            <>
                <strong>📍 {place.name}</strong>
                {place.address && <span style={{ fontSize: '0.85rem', color: '#666' }}>🏠 {place.address}</span>}
                {place.notes && <span style={{ fontSize: '0.85rem', color: '#666' }}>📝 {place.notes}</span>}
                {isSelected && <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '0.5rem' }}>✓</span>}
            </>
        ),
    },
};