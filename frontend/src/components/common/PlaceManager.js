import React, { useState, useEffect } from 'react';
import { placeService } from '../../services/placeService';
import PlaceForm from '../common/PlaceForm';

function PlaceManager({ onClose, onSelectPlace, selectedPlaceId }) {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        notes: '',
    });

    useEffect(() => {
        loadPlaces();
    }, []);

    const loadPlaces = async () => {
        try {
            setLoading(true);
            const data = await placeService.getPlaces();
            setPlaces(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке мест:', err);
            setError('Не удалось загрузить места');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlace = async (e) => {
        e.preventDefault();
        try {
            const newPlace = await placeService.createPlace(formData);
            setPlaces([...places, newPlace]);
            setShowForm(false);
            setEditingPlace(null);
            setFormData({ name: '', address: '', notes: '' });
            onSelectPlace(newPlace);
        } catch (err) {
            console.error('Ошибка при создании места:', err);
            alert('Не удалось создать место');
        }
    };

    const handleEditPlace = (place) => {
        setEditingPlace(place);
        setFormData({
            name: place.name,
            address: place.address,
            notes: place.notes || '',
        });
        setShowForm(true);
    };

    const handleUpdatePlace = async (e) => {
        e.preventDefault();
        try {
            const updated = await placeService.updatePlace(editingPlace.id, formData);
            setPlaces(places.map(p => p.id === updated.id ? updated : p));
            setEditingPlace(null);
            setShowForm(false);
            setFormData({ name: '', address: '', notes: '' });
        } catch (err) {
            console.error('Ошибка при обновлении места:', err);
            alert('Не удалось обновить место');
        }
    };

    const handleDeletePlace = async (placeId, placeName) => {
        if (window.confirm(`Удалить место "${placeName}"?`)) {
            try {
                await placeService.deletePlace(placeId);
                setPlaces(places.filter(p => p.id !== placeId));
            } catch (err) {
                console.error('Ошибка при удалении места:', err);
                alert('Не удалось удалить место');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingPlace(null);
        setFormData({ name: '', address: '', notes: '' });
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>📍 Места</h2>
                    <button onClick={onClose} style={styles.closeButton}>✕</button>
                </div>

                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    style={styles.addButton}
                >
                    {showForm ? 'Отмена' : '+ Новое место'}
                </button>

                {showForm && (
                    <PlaceForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={editingPlace ? handleUpdatePlace : handleCreatePlace}
                        onCancel={resetForm}
                        isEditing={!!editingPlace}
                    />
                )}

                {loading && <div>Загрузка...</div>}
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.list}>
                    {places.map(place => (
                        <div key={place.id} style={styles.placeItem}>
                            <div
                                style={{
                                    ...styles.placeInfo,
                                    backgroundColor: selectedPlaceId === place.id ? '#e3f2fd' : 'transparent',
                                }}
                                onClick={() => onSelectPlace(place)}
                            >
                                <strong>📍 {place.name}</strong>
                                {place.address && <span style={styles.detail}>🏠 {place.address}</span>}
                                {place.notes && <span style={styles.detail}>📝 {place.notes}</span>}
                                {selectedPlaceId === place.id && <span style={styles.checkmark}>✓</span>}
                            </div>
                            <div style={styles.placeActions}>
                                <button onClick={() => handleEditPlace(place)} style={styles.editButton} title="Редактировать">✏️</button>
                                <button onClick={() => handleDeletePlace(place.id, place.name)} style={styles.deleteButton} title="Удалить">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>

                {places.length === 0 && !loading && (
                    <p style={styles.empty}>Нет мест. Создайте первое место!</p>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#888',
    },
    addButton: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '1rem',
    },
    form: {
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
    },
    input: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    submitButton: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    list: {
        maxHeight: '400px',
        overflow: 'auto',
    },
    placeItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        borderBottom: '1px solid #eee',
    },
    placeInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '4px',
    },
    detail: {
        fontSize: '0.85rem',
        color: '#666',
    },
    placeActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    editButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e3f2fd',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    deleteButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#ffebee',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    checkmark: {
        color: '#28a745',
        fontWeight: 'bold',
        marginLeft: '0.5rem',
    },
    error: {
        color: '#dc3545',
        padding: '0.5rem',
        textAlign: 'center',
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        padding: '1rem',
    },
};

export default PlaceManager;