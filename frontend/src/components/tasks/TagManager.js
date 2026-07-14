import React, { useState, useEffect } from 'react';
import { tagService } from '../../services/tagService';
import TagForm from '../common/TagForm';

function TagManager({ onClose, onSelectTag, selectedTags = [] }) {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#6c757d',
    });

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setLoading(true);
            const data = await tagService.getTags();
            setTags(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке тегов:', err);
            setError('Не удалось загрузить теги');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        try {
            const newTag = await tagService.createTag(formData);
            setTags([...tags, newTag]);
            setShowForm(false);
            setEditingTag(null);
            setFormData({ name: '', color: '#6c757d' });
            onSelectTag(newTag);
        } catch (err) {
            console.error('Ошибка при создании тега:', err);
            alert('Не удалось создать тег');
        }
    };

    const handleEditTag = (tag) => {
        setEditingTag(tag);
        setFormData({
            name: tag.name,
            color: tag.color,
        });
        setShowForm(true);
    };

    const handleUpdateTag = async (e) => {
        e.preventDefault();
        try {
            const updated = await tagService.updateTag(editingTag.id, formData);
            setTags(tags.map(t => t.id === updated.id ? updated : t));
            setEditingTag(null);
            setShowForm(false);
            setFormData({ name: '', color: '#6c757d' });
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
            } catch (err) {
                console.error('Ошибка при удалении тега:', err);
                alert('Не удалось удалить тег');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingTag(null);
        setFormData({ name: '', color: '#6c757d' });
    };

    const isSelected = (tagId) => {
        return selectedTags.some(t => t.id === tagId);
    };

    const handleTagClick = (tag) => {
        onSelectTag(tag);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>🏷️ Теги</h2>
                    <button onClick={onClose} style={styles.closeButton}>✕</button>
                </div>

                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    style={styles.addButton}
                >
                    {showForm ? 'Отмена' : '+ Новый тег'}
                </button>

                {showForm && (
                    <TagForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
                        onCancel={resetForm}
                        isEditing={!!editingTag}
                    />
                )}

                {loading && <div>Загрузка...</div>}
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.list}>
                    {tags.map(tag => (
                        <div
                            key={tag.id}
                            style={{
                                ...styles.tagItem,
                                backgroundColor: isSelected(tag.id) ? tag.color + '40' : '#f9f9f9',
                                borderLeftColor: tag.color,
                            }}
                        >
                            <div
                                style={styles.tagInfo}
                                onClick={() => handleTagClick(tag)}
                            >
                                <span style={styles.tagName}>🏷️ {tag.name}</span>
                                {isSelected(tag.id) && <span style={styles.checkMark}>✓</span>}
                            </div>
                            <div style={styles.tagActions}>
                                <button
                                    onClick={() => handleEditTag(tag)}
                                    style={styles.editButton}
                                    title="Редактировать"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDeleteTag(tag.id, tag.name)}
                                    style={styles.deleteButton}
                                    title="Удалить"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {tags.length === 0 && !loading && (
                    <p style={styles.empty}>Нет тегов. Создайте первый тег!</p>
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
        maxWidth: '450px',
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
    colorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    colorLabel: {
        fontSize: '0.9rem',
        color: '#666',
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
    submitButton: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '0.5rem',
    },
    list: {
        maxHeight: '400px',
        overflow: 'auto',
    },
    tagItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        marginBottom: '0.5rem',
        borderRadius: '4px',
        borderLeft: '4px solid',
        transition: 'all 0.2s',
    },
    tagInfo: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
    },
    tagName: {
        fontSize: '0.9rem',
    },
    tagActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    editButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e3f2fd',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    deleteButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#ffebee',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    checkMark: {
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

export default TagManager;