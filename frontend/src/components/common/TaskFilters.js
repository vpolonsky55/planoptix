import React, { useState, useEffect } from 'react';
import { personService } from '../../services/personService';
import { tagService } from '../../services/tagService';
import { placeService } from '../../services/placeService';
import EntityManager from './EntityManager';
import { personConfig } from '../../config/personConfig';
import { tagConfig } from '../../config/tagConfig';
import { placeConfig } from '../../config/placeConfig';
import styles from './TaskFilters.module.css';  // 👈 CSS-модуль

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

    // Состояния для модальных окон EntityManager
    const [showPersonManager, setShowPersonManager] = useState(false);
    const [showTagManager, setShowTagManager] = useState(false);
    const [showPlaceManager, setShowPlaceManager] = useState(false);

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
    }, [selectedPeople, selectedTags, selectedPlaces, selectedStatus, selectedDateRange, onFilterChange]);

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

    const togglePlace = (place) => {
        let newSelected;
        if (selectedPlaces.find(p => p.id === place.id)) {
            newSelected = selectedPlaces.filter(p => p.id !== place.id);
        } else {
            newSelected = [...selectedPlaces, place];
        }
        setSelectedPlaces(newSelected);
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
        setSelectedPlaces([]);
        setSelectedStatus('all');
        setSelectedDateRange('all');
    };

    const hasActiveFilters = selectedPeople.length > 0 ||
        selectedTags.length > 0 ||
        selectedPlaces.length > 0 ||
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

    // Обработчики для EntityManager
    const handlePersonSelect = (person) => {
        if (!selectedPeople.find(p => p.id === person.id)) {
            setSelectedPeople([...selectedPeople, person]);
        }
        setShowPersonManager(false);
    };

    const handleTagSelect = (tag) => {
        if (!selectedTags.find(t => t.id === tag.id)) {
            setSelectedTags([...selectedTags, tag]);
        }
        setShowTagManager(false);
    };

    const handlePlaceSelect = (place) => {
        if (!selectedPlaces.find(p => p.id === place.id)) {
            setSelectedPlaces([...selectedPlaces, place]);
        }
        setShowPlaceManager(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>🔍 Фильтры</h3>
                {hasActiveFilters && (
                    <button onClick={clearFilters} className={styles.clearButton}>
                        Сбросить все
                    </button>
                )}
            </div>

            <div className={styles.filtersRow}>
                {/* Статус */}
                <div className={styles.filterGroup}>
                    <button onClick={() => setShowStatus(!showStatus)} className={styles.filterButton}>
                        {getStatusLabel()}
                    </button>
                    {showStatus && (
                        <div className={styles.dropdown}>
                            {statusOptions.map(option => (
                                <div key={option.value} onClick={() => handleStatusChange(option.value)} className={styles.filterItem}>
                                    <span>{option.icon} {option.label}</span>
                                    {selectedStatus === option.value && <span className={styles.checkmark}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Дата */}
                <div className={styles.filterGroup}>
                    <button onClick={() => setShowDate(!showDate)} className={styles.filterButton}>
                        {getDateLabel()}
                    </button>
                    {showDate && (
                        <div className={styles.dropdown}>
                            {dateOptions.map(option => (
                                <div key={option.value} onClick={() => handleDateRangeChange(option.value)} className={styles.filterItem}>
                                    <span>{option.icon} {option.label}</span>
                                    {selectedDateRange === option.value && <span className={styles.checkmark}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Участники */}
                <div className={styles.filterGroup}>
                    <button onClick={() => setShowPeople(!showPeople)} className={styles.filterButton}>
                        👥 Участники {selectedPeople.length > 0 && `(${selectedPeople.length})`}
                    </button>
                    {showPeople && (
                        <div className={styles.dropdownLarge}>
                            {people.length === 0 ? (
                                <div className={styles.empty}>Нет контактов</div>
                            ) : (
                                people.map(person => (
                                    <div key={person.id} className={styles.filterItemWithActions}>
                                        <div className={styles.filterItemContent} onClick={() => togglePerson(person)}>
                                            <span>👤 {person.first_name} {person.last_name || ''}</span>
                                            {selectedPeople.find(p => p.id === person.id) && <span className={styles.checkmark}>✓</span>}
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button onClick={() => setShowPersonManager(true)} className={styles.editButton} title="Редактировать">✏️</button>
                                            <button onClick={() => togglePerson(person)} className={styles.deleteButton} title="Удалить">🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Теги */}
                <div className={styles.filterGroup}>
                    <button onClick={() => setShowTags(!showTags)} className={styles.filterButton}>
                        🏷️ Теги {selectedTags.length > 0 && `(${selectedTags.length})`}
                    </button>
                    {showTags && (
                        <div className={styles.dropdownLarge}>
                            {tags.length === 0 ? (
                                <div className={styles.empty}>Нет тегов</div>
                            ) : (
                                tags.map(tag => (
                                    <div key={tag.id} className={styles.filterItemWithActions} style={{ borderLeft: `3px solid ${tag.color}` }}>
                                        <div className={styles.filterItemContent} onClick={() => toggleTag(tag)}>
                                            <span>🏷️ {tag.name}</span>
                                            {selectedTags.find(t => t.id === tag.id) && <span className={styles.checkmark}>✓</span>}
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button onClick={() => setShowTagManager(true)} className={styles.editButton} title="Редактировать">✏️</button>
                                            <button onClick={() => toggleTag(tag)} className={styles.deleteButton} title="Удалить">🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Места */}
                <div className={styles.filterGroup}>
                    <button onClick={() => setShowPlaces(!showPlaces)} className={styles.filterButton}>
                        📍 Места {selectedPlaces.length > 0 && `(${selectedPlaces.length})`}
                    </button>
                    {showPlaces && (
                        <div className={styles.dropdownLarge}>
                            {places.length === 0 ? (
                                <div className={styles.empty}>Нет мест</div>
                            ) : (
                                places.map(place => (
                                    <div key={place.id} className={styles.filterItemWithActions}>
                                        <div className={styles.filterItemContent} onClick={() => togglePlace(place)}>
                                            <span>📍 {place.name}</span>
                                            {selectedPlaces.find(p => p.id === place.id) && <span className={styles.checkmark}>✓</span>}
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button onClick={() => setShowPlaceManager(true)} className={styles.editButton} title="Редактировать">✏️</button>
                                            <button onClick={() => togglePlace(place)} className={styles.deleteButton} title="Удалить">🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Модальные окна EntityManager */}
            {showPersonManager && (
                <EntityManager
                    {...personConfig}
                    onClose={() => setShowPersonManager(false)}
                    onSelect={handlePersonSelect}
                    selectedIds={selectedPeople.map(p => p.id)}
                />
            )}

            {showTagManager && (
                <EntityManager
                    {...tagConfig}
                    onClose={() => setShowTagManager(false)}
                    onSelect={handleTagSelect}
                    selectedIds={selectedTags.map(t => t.id)}
                />
            )}

            {showPlaceManager && (
                <EntityManager
                    {...placeConfig}
                    onClose={() => setShowPlaceManager(false)}
                    onSelect={handlePlaceSelect}
                    selectedIds={selectedPlaces.map(p => p.id)}
                />
            )}

            {/* Активные фильтры */}
            {hasActiveFilters && (
                <div className={styles.activeFilters}>
                    {selectedStatus !== 'all' && (
                        <span className={styles.activeFilterTag}>
                            {statusOptions.find(o => o.value === selectedStatus)?.icon} {statusOptions.find(o => o.value === selectedStatus)?.label}
                            <button onClick={() => setSelectedStatus('all')} className={styles.removeFilter}>×</button>
                        </span>
                    )}
                    {selectedDateRange !== 'all' && (
                        <span className={styles.activeFilterTag}>
                            {dateOptions.find(o => o.value === selectedDateRange)?.icon} {dateOptions.find(o => o.value === selectedDateRange)?.label}
                            <button onClick={() => setSelectedDateRange('all')} className={styles.removeFilter}>×</button>
                        </span>
                    )}
                    {selectedPeople.map(person => (
                        <span key={person.id} className={styles.activeFilterTag}>
                            👤 {person.first_name} {person.last_name || ''}
                            <button onClick={() => togglePerson(person)} className={styles.removeFilter}>×</button>
                        </span>
                    ))}
                    {selectedTags.map(tag => (
                        <span key={tag.id} className={styles.activeFilterTag} style={{ backgroundColor: tag.color + '20', borderLeft: `3px solid ${tag.color}` }}>
                            🏷️ {tag.name}
                            <button onClick={() => toggleTag(tag)} className={styles.removeFilter}>×</button>
                        </span>
                    ))}
                    {selectedPlaces.map(place => (
                        <span key={place.id} className={styles.activeFilterTag}>
                            📍 {place.name}
                            <button onClick={() => togglePlace(place)} className={styles.removeFilter}>×</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TaskFilters;