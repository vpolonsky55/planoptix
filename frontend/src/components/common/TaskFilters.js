import React, { useState, useEffect } from 'react';
import { personService } from '../../services/personService';
import { tagService } from '../../services/tagService';
import { placeService } from '../../services/placeService'; //добавить импорт
import PersonForm from '../common/PersonForm';
import TagForm from './TagForm';
import PlaceForm from './PlaceForm';

function TaskFilters({ onFilterChange, currentFilters }) {
    const [people, setPeople] = useState([]);
    const [tags, setTags] = useState([]);
    const [places, setPlaces] = useState([]);
    const [showPeople, setShowPeople] = useState(false);
    const [showTags, setShowTags] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [showPlaces, setShowPlaces] = useState(false);

    const [selectedPeople, setSelectedPeople] = useState(currentFilters?.people || []);
    const [selectedTags, setSelectedTags] = useState(currentFilters?.tags || []);
    const [selectedStatus, setSelectedStatus] = useState(currentFilters?.status || 'all');
    const [selectedDateRange, setSelectedDateRange] = useState(currentFilters?.dateRange || 'all');
    const [selectedPlaces, setSelectedPlaces] = useState(currentFilters?.places || []);

    // Состояния для редактирования
    const [editingPerson, setEditingPerson] = useState(null);
    const [editingTag, setEditingTag] = useState(null);
    const [editFormData, setEditFormData] = useState({ 
        first_name: '', 
        last_name: '', 
        phone: '', 
        email: '',
        notes: '',
    });
    const [editTagData, setEditTagData] = useState({ name: '', color: '#6c757d' });
    const [editingPlace, setEditingPlace] = useState(null);
    const [editPlaceData, setEditPlaceData] = useState({ name: '', address: '', notes: '' });

    useEffect(() => {
        loadPeople();
        loadTags();
        loadPlaces(); 
    }, []);

    useEffect(() => {
        onFilterChange({
            people: selectedPeople,
            tags: selectedTags,
            places: selectedPlaces,
            status: selectedStatus,
            dateRange: selectedDateRange,
        });
    }, [selectedPeople,
        selectedTags,
        selectedPlaces,
        selectedStatus,
        selectedDateRange,
        onFilterChange]);

    const loadPeople = async () => {
        try {
            const data = await personService.getPeople();
            setPeople(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Ошибка при загрузке контактов:', err);
        }
    };

    const loadTags = async () => {
        try {
            const data = await tagService.getTags();
            setTags(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Ошибка при загрузке тегов:', err);
        }
    };

    // загрузка мест
    const loadPlaces = async () => {
        try {
            const data = await placeService.getPlaces();
            setPlaces(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Ошибка при загрузке мест:', err);
        }
    };

    const togglePerson = (person) => {
        let newSelected;
        if (selectedPeople.find(p => p.id === person.id)) {
            newSelected = selectedPeople.filter(p => p.id !== person.id);
        } else {
            newSelected = [...selectedPeople, person];
        }
        setSelectedPeople(newSelected);
    };

    const toggleTag = (tag) => {
        let newSelected;
        if (selectedTags.find(t => t.id === tag.id)) {
            newSelected = selectedTags.filter(t => t.id !== tag.id);
        } else {
            newSelected = [...selectedTags, tag];
        }
        setSelectedTags(newSelected);
    };

    // переключатель места
    const togglePlace = (place) => {
        let newSelected;
        if (selectedPlaces.find(p => p.id === place.id)) {
            newSelected = selectedPlaces.filter(p => p.id !== place.id);
        } else {
            newSelected = [...selectedPlaces, place];
        }
        setSelectedPlaces(newSelected);
        onFilterChange({
            people: selectedPeople,
            tags: selectedTags,
            places: newSelected,
            status: selectedStatus,
            dateRange: selectedDateRange,
        });
    };


    // Редактирование контакта
    const handleEditPerson = (person) => {
        setEditingPerson(person);
        setEditFormData({
            first_name: person.first_name,
            last_name: person.last_name || '',
            phone: person.phone || '',
            email: person.email || '',
            notes: person.notes || '',
        });
    };

    const handleUpdatePerson = async () => {
        try {
            const updated = await personService.updatePerson(editingPerson.id, editFormData);
            setPeople(people.map(p => p.id === updated.id ? updated : p));
            // Обновляем выбранных, если этот контакт был выбран
            if (selectedPeople.find(p => p.id === updated.id)) {
                setSelectedPeople(selectedPeople.map(p => p.id === updated.id ? updated : p));
            }
            setEditingPerson(null);
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
                setSelectedPeople(selectedPeople.filter(p => p.id !== personId));
            } catch (err) {
                console.error('Ошибка при удалении контакта:', err);
                alert('Не удалось удалить контакт');
            }
        }
    };

    // Редактирование тега
    const handleEditTag = (tag) => {
        resetTagForm();
        setEditingTag(tag);
        setEditTagData({
            name: tag.name,
            color: tag.color,
        });
    };

    const handleUpdateTag = async () => {
        try {
            const updated = await tagService.updateTag(editingTag.id, editTagData);
            setTags(tags.map(t => t.id === updated.id ? updated : t));
            if (selectedTags.find(t => t.id === updated.id)) {
                setSelectedTags(selectedTags.map(t => t.id === updated.id ? updated : t));
            }
            resetTagForm();
        } catch (err) {
            console.error('Ошибка при обновлении тега:', err);
            alert('Не удалось обновить тег');
        }
    };

    const handleDeleteTag = async (tagId, tagName) => {
        if (window.confirm(`Удалить тег "${tagName}"?`)) {
            try {
                await tagService.deleteTag(tagId);
                setTags(tags.filter(t => t.id !== tagId));
                setSelectedTags(selectedTags.filter(t => t.id !== tagId));
            } catch (err) {
                console.error('Ошибка при удалении тега:', err);
                alert('Не удалось удалить тег');
            }
        }
    };

    const resetTagForm = () => {
        setEditingTag(null);
        setEditTagData({ name: '', color: '#6c757d' });
    };

    // Редактирование места
    const handleEditPlace = (place) => {
        setEditingPlace(place);
        setEditPlaceData({
            name: place.name,
            address: place.address,
            notes: place.notes || '',
        });
    };

    // Обновление места
    const handleUpdatePlace = async () => {
        try {
            const updated = await placeService.updatePlace(editingPlace.id, editPlaceData);
            setPlaces(places.map(p => p.id === updated.id ? updated : p));
            if (selectedPlaces.find(p => p.id === updated.id)) {
                setSelectedPlaces(selectedPlaces.map(p => p.id === updated.id ? updated : p));
            }
            resetPlaceForm();
        } catch (err) {
            console.error('Ошибка при обновлении места:', err);
            alert('Не удалось обновить место');
        }
    };

    // Удаление места
    const handleDeletePlace = async (placeId, placeName) => {
        if (window.confirm(`Удалить место "${placeName}"?`)) {
            try {
                await placeService.deletePlace(placeId);
                setPlaces(places.filter(p => p.id !== placeId));
                setSelectedPlaces(selectedPlaces.filter(p => p.id !== placeId));
            } catch (err) {
                console.error('Ошибка при удалении места:', err);
                alert('Не удалось удалить место');
            }
        }
    };

    const resetPlaceForm = () => {
        setEditingPlace(null);
        setEditPlaceData({ name: '', address: '', notes: '' });
    };

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setShowStatus(false);
    };

    const handleDateRangeChange = (range) => {
        setSelectedDateRange(range);
        setShowDate(false);
    };

    const clearFilters = () => {
        setSelectedPeople([]);
        setSelectedTags([]);
        setSelectedPlaces([]); // добавляем сюда для очистки
        setSelectedStatus('all');
        setSelectedDateRange('all');
    };

    const hasActiveFilters = selectedPeople.length > 0 ||
        selectedTags.length > 0 ||
        selectedPlaces.length > 0 || //добавляем условие
        selectedStatus !== 'all' ||
        selectedDateRange !== 'all';

    const statusOptions = [
        { value: 'all', label: 'Все задачи', icon: '📋' },
        { value: 'active', label: 'Активные (не выполненные)', icon: '🟢' },
        { value: 'completed', label: 'Выполненные', icon: '✅' },
    ];

    const dateOptions = [
        { value: 'all', label: 'Все даты', icon: '📅' },
        { value: 'today', label: 'Сегодня', icon: '🌟' },
        { value: 'tomorrow', label: 'Завтра', icon: '⏰' },
        { value: 'this_week', label: 'Эта неделя', icon: '📆' },
        { value: 'next_week', label: 'Следующая неделя', icon: '📅' },
        { value: 'overdue', label: 'Просроченные', icon: '⚠️' },
        { value: 'no_date', label: 'Без даты', icon: '📭' },
    ];

    const getStatusLabel = () => {
        const option = statusOptions.find(o => o.value === selectedStatus);
        return option ? `${option.icon} ${option.label}` : '📋 Статус';
    };

    const getDateLabel = () => {
        const option = dateOptions.find(o => o.value === selectedDateRange);
        return option ? `${option.icon} ${option.label}` : '📅 Дата';
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>🔍 Фильтры</h3>
                {hasActiveFilters && (
                    <button onClick={clearFilters} style={styles.clearButton}>
                        Сбросить все
                    </button>
                )}
            </div>

            <div style={styles.filtersRow}>
                <div style={styles.filterGroup}>
                    <button onClick={() => setShowStatus(!showStatus)} style={styles.filterButton}>
                        {getStatusLabel()}
                    </button>
                    {showStatus && (
                        <div style={styles.dropdown}>
                            {statusOptions.map(option => (
                                <div key={option.value} onClick={() => handleStatusChange(option.value)} style={styles.filterItem}>
                                    <span>{option.icon} {option.label}</span>
                                    {selectedStatus === option.value && <span style={styles.checkmark}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={styles.filterGroup}>
                    <button onClick={() => setShowDate(!showDate)} style={styles.filterButton}>
                        {getDateLabel()}
                    </button>
                    {showDate && (
                        <div style={styles.dropdown}>
                            {dateOptions.map(option => (
                                <div key={option.value} onClick={() => handleDateRangeChange(option.value)} style={styles.filterItem}>
                                    <span>{option.icon} {option.label}</span>
                                    {selectedDateRange === option.value && <span style={styles.checkmark}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Фильтр по участникам с кнопками редактирования */}
                <div style={styles.filterGroup}>
                    <button onClick={() => setShowPeople(!showPeople)} style={styles.filterButton}>
                        👥 Участники {selectedPeople.length > 0 && `(${selectedPeople.length})`}
                    </button>
                    {showPeople && (
                        <div style={styles.dropdownLarge}>
                            {people.length === 0 ? (
                                <div style={styles.empty}>Нет контактов</div>
                            ) : (
                                people.map(person => (
                                    <div key={person.id} style={styles.filterItemWithActions}>
                                        <div style={styles.filterItemContent} onClick={() => togglePerson(person)}>
                                            <span>👤 {person.first_name} {person.last_name || ''}</span>
                                            {selectedPeople.find(p => p.id === person.id) && <span style={styles.checkmark}>✓</span>}
                                        </div>
                                        <div style={styles.itemActions}>
                                            <button onClick={() => handleEditPerson(person)} style={styles.editButton} title="Редактировать">✏️</button>
                                            <button onClick={() => handleDeletePerson(person.id, person.first_name)} style={styles.deleteButton} title="Удалить">🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Фильтр по тегам с кнопками редактирования */}
                <div style={styles.filterGroup}>
                    <button onClick={() => setShowTags(!showTags)} style={styles.filterButton}>
                        🏷️ Теги {selectedTags.length > 0 && `(${selectedTags.length})`}
                    </button>
                    {showTags && (
                        <div style={styles.dropdownLarge}>
                            {tags.length === 0 ? (
                                <div style={styles.empty}>Нет тегов</div>
                            ) : (
                                tags.map(tag => (
                                    <div key={tag.id} style={{ ...styles.filterItemWithActions, borderLeft: `3px solid ${tag.color}` }}>
                                        <div style={styles.filterItemContent} onClick={() => toggleTag(tag)}>
                                            <span>🏷️ {tag.name}</span>
                                            {selectedTags.find(t => t.id === tag.id) && <span style={styles.checkmark}>✓</span>}
                                        </div>
                                        <div style={styles.itemActions}>
                                            <button onClick={() => handleEditTag(tag)} style={styles.editButton} title="Редактировать">✏️</button>
                                            <button onClick={() => handleDeleteTag(tag.id, tag.name)} style={styles.deleteButton} title="Удалить">🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Добавь в JSX (рядом с другими фильтрами): */}
                <div style={styles.filterGroup}>
                    <button onClick={() => setShowPlaces(!showPlaces)} style={styles.filterButton}>
                        📍 Места {selectedPlaces.length > 0 && `(${selectedPlaces.length})`}
                    </button>
                    {showPlaces && (
                        <div style={styles.dropdownLarge}>
                            {places.length === 0 ? (
                                <div style={styles.empty}>Нет мест</div>
                            ) : (
                                places.map(place => (
                                    <div key={place.id} style={styles.filterItemWithActions}>
                                        <div style={styles.filterItemContent} onClick={() => togglePlace(place)}>
                                            <span>📍 {place.name}</span>
                                            {selectedPlaces.find(p => p.id === place.id) && <span style={styles.checkmark}>✓</span>}
                                        </div>
                                        <div style={styles.itemActions}>
                                            <button onClick={() => handleEditPlace(place)} style={styles.editButton}>✏️</button>
                                            <button onClick={() => handleDeletePlace(place.id, place.name)} style={styles.deleteButton}>🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно редактирования контакта */}
            {editingPerson && (
                <div style={styles.editModalOverlay}>
                    <div style={styles.editModal}>
                        <h3>✏️ Редактировать контакт</h3>
                        <PersonForm
                            formData={editFormData}
                            onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                            onSubmit={handleUpdatePerson}
                            onCancel={() => setEditingPerson(null)}
                            isEditing={true}
                        />
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования тега */}
            {editingTag && (
                <div style={styles.editModalOverlay}>
                    <div style={styles.editModal}>
                        <h3>✏️ Редактировать тег</h3>
                        <TagForm
                            formData={editTagData} 
                            onChange={(e) => setEditTagData({ ...editTagData, [e.target.name]: e.target.value })}
                            onSubmit={handleUpdateTag}
                            onCancel={resetTagForm}
                            isEditing={true}
                        />
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования места */}
            {editingPlace && (
                <div style={styles.editModalOverlay}>
                    <div style={styles.editModal}>
                        <h3>✏️ Редактировать место</h3>
                        <PlaceForm
                            formData={editPlaceData} 
                            onChange={(e) => setEditPlaceData({ ...editPlaceData, [e.target.name]: e.target.value })}
                            onSubmit={handleUpdatePlace}
                            onCancel={resetPlaceForm}
                            isEditing={true}
                        />
                    </div>
                </div>
            )}

            {/* Активные фильтры */}
            {hasActiveFilters && (
                <div style={styles.activeFilters}>
                    {selectedStatus !== 'all' && (
                        <span style={styles.activeFilterTag}>
                            {statusOptions.find(o => o.value === selectedStatus)?.icon} {statusOptions.find(o => o.value === selectedStatus)?.label}
                            <button onClick={() => setSelectedStatus('all')} style={styles.removeFilter}>×</button>
                        </span>
                    )}
                    {selectedDateRange !== 'all' && (
                        <span style={styles.activeFilterTag}>
                            {dateOptions.find(o => o.value === selectedDateRange)?.icon} {dateOptions.find(o => o.value === selectedDateRange)?.label}
                            <button onClick={() => setSelectedDateRange('all')} style={styles.removeFilter}>×</button>
                        </span>
                    )}
                    {selectedPeople.map(person => (
                        <span key={person.id} style={styles.activeFilterTag}>
                            👤 {person.first_name} {person.last_name || ''}
                            <button onClick={() => togglePerson(person)} style={styles.removeFilter}>×</button>
                        </span>
                    ))}
                    {selectedTags.map(tag => (
                        <span key={tag.id} style={{ ...styles.activeFilterTag, backgroundColor: tag.color + '20', borderLeft: `3px solid ${tag.color}` }}>
                            🏷️ {tag.name}
                            <button onClick={() => toggleTag(tag)} style={styles.removeFilter}>×</button>
                        </span>
                    ))}
                    {/* отображение выбранных мест в активных фильтрах */}
                    {selectedPlaces.map(place => (
                        <span key={place.id} style={styles.activeFilterTag}>
                            📍 {place.name}
                            <button onClick={() => togglePlace(place)} style={styles.removeFilter}>×</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem',
        border: '1px solid #eee',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    title: {
        margin: 0,
        fontSize: '1rem',
        fontWeight: '500',
        color: '#333',
    },
    clearButton: {
        padding: '0.25rem 0.75rem',
        fontSize: '0.8rem',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#666',
    },
    filtersRow: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    filterGroup: {
        position: 'relative',
    },
    filterButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: '0.25rem',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
        minWidth: '220px',
        maxHeight: '280px',
        overflow: 'auto',
    },
    dropdownLarge: {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: '0.25rem',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
        minWidth: '280px',
        maxHeight: '300px',
        overflow: 'auto',
    },
    filterItem: {
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background-color 0.2s',
    },
    filterItemWithActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #eee',
        transition: 'background-color 0.2s',
    },
    filterItemContent: {
        flex: 1,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemActions: {
        display: 'flex',
        gap: '0.5rem',
        marginLeft: '0.5rem',
    },
    editButton: {
        padding: '0.2rem 0.4rem',
        backgroundColor: '#e3f2fd',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
    },
    deleteButton: {
        padding: '0.2rem 0.4rem',
        backgroundColor: '#ffebee',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
    },
    checkmark: {
        color: '#28a745',
        fontWeight: 'bold',
        marginLeft: '0.5rem',
    },
    empty: {
        padding: '0.5rem 1rem',
        color: '#888',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    activeFilters: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
    },
    activeFilterTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '0.85rem',
    },
    removeFilter: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#dc3545',
        padding: '0 0.25rem',
        marginLeft: '0.25rem',
    },
    editModalOverlay: {
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
    editModal: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        width: '350px',
        maxWidth: '90%',
    },
    editInput: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    colorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    colorInput: {
        width: '50px',
        height: '35px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    colorPreview: {
        width: '35px',
        height: '35px',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    editModalButtons: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    saveButton: {
        flex: 1,
        padding: '0.5rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelButton: {
        flex: 1,
        padding: '0.5rem',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default TaskFilters;