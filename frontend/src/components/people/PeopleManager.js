import React, { useState, useEffect } from 'react';
import { personService } from '../../services/personService';
import PersonForm from '../common/PersonForm';

function PeopleManager({ onClose, onSelectPerson }) {
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        notes: '',
    });

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        try {
            setLoading(true);
            const data = await personService.getPeople();
            setPeople(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке контактов:', err);
            setError('Не удалось загрузить контакты');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePerson = async (e) => {
        e.preventDefault();
        try {
            const newPerson = await personService.createPerson(formData);
            setPeople([...people, newPerson]);
            setShowForm(false);
            setEditingPerson(null);
            setFormData({ first_name: '', last_name: '', phone: '', email: '', notes: ''  });
        } catch (err) {
            console.error('Ошибка при создании контакта:', err);
            alert('Не удалось создать контакт');
        }
    };

    const handleEditPerson = (person) => {
        setEditingPerson(person);
        setFormData({
            first_name: person.first_name,
            last_name: person.last_name || '',
            phone: person.phone || '',
            email: person.email || '',
            notes: person.notes || '',
        });
        setShowForm(true);
    };

    const handleUpdatePerson = async (e) => {
        e.preventDefault();
        try {
            const updated = await personService.updatePerson(editingPerson.id, formData);
            setPeople(people.map(p => p.id === updated.id ? updated : p));
            setEditingPerson(null);
            setShowForm(false);
            setFormData({ first_name: '', last_name: '', phone: '', email: '', notes: '' });
        } catch (err) {
            console.error('Ошибка при обновлении контакта:', err);
            alert('Не удалось обновить контакт');
        }
    };

    const handleDeletePerson = async (personId, personName) => {
        if (window.confirm(`Удалить контакт "${personName}"?`)) {
            try {
                await personService.deletePerson(personId);
                setPeople(people.filter(p => p.id !== personId));
            } catch (err) {
                console.error('Ошибка при удалении контакта:', err);
                alert('Не удалось удалить контакт');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingPerson(null);
        setFormData({ first_name: '', last_name: '', phone: '', email: '', notes: '' });
    };
    console.log('=== PeopleManager загружен, версия с notes ===');
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>👥 Контакты</h2>
                    <button onClick={onClose} style={styles.closeButton}>✕</button>
                </div>

                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    style={styles.addButton}
                >
                    {showForm ? 'Отмена' : '+ Новый контакт'}
                </button>

                {showForm && (
                    <PersonForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={editingPerson ? handleUpdatePerson : handleCreatePerson}
                        onCancel={resetForm}
                        isEditing={!!editingPerson}
                    />
                )}

                {loading && <div>Загрузка...</div>}
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.list}>
                    {people.map(person => (
                        <div key={person.id} style={styles.personItem}>
                            <div
                                style={styles.personInfo}
                                onClick={() => onSelectPerson(person)}
                            >
                                <strong>{person.first_name} {person.last_name || ''}</strong>
                                {person.phone && <span style={styles.detail}>📞 {person.phone}</span>}
                                {person.email && <span style={styles.detail}>✉️ {person.email}</span>}
                            </div>
                            <div style={styles.personActions}>
                                <button
                                    onClick={() => handleEditPerson(person)}
                                    style={styles.editButton}
                                    title="Редактировать"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDeletePerson(person.id, person.first_name)}
                                    style={styles.deleteButton}
                                    title="Удалить"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {people.length === 0 && !loading && (
                    <p style={styles.empty}>Нет контактов. Создайте первый контакт!</p>
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
    personItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        borderBottom: '1px solid #eee',
        transition: 'background-color 0.2s',
    },
    personInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        cursor: 'pointer',
    },
    detail: {
        fontSize: '0.85rem',
        color: '#666',
    },
    personActions: {
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

export default PeopleManager;