import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService';

function ResourceManager({ onClose, onSelectResource, selectedResourceIds = [] }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        resource_type: 'link',
        url: '',
        file: null,
    });

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getResources();
            setResources(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке ресурсов:', err);
            setError('Не удалось загрузить ресурсы');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            if (formData.description) formDataToSend.append('description', formData.description);
            formDataToSend.append('resource_type', formData.resource_type);

            if (formData.resource_type === 'link' && formData.url) {
                formDataToSend.append('url', formData.url);
            }
            if (formData.resource_type === 'file' && formData.file) {
                formDataToSend.append('file', formData.file);
            }

            const newResource = await resourceService.createResource(formDataToSend);
            setResources([...resources, newResource]);
            setShowForm(false);
            setEditingResource(null);
            setFormData({ name: '', description: '', resource_type: 'link', url: '', file: null });
            onSelectResource(newResource);
        } catch (err) {
            console.error('Ошибка при создании ресурса:', err);
            alert('Не удалось создать ресурс');
        }
    };

    const handleEditResource = (resource) => {
        setEditingResource(resource);
        setFormData({
            name: resource.name,
            description: resource.description || '',
            resource_type: resource.resource_type,
            url: resource.url || '',
            file: null,
        });
        setShowForm(true);
    };

    const handleUpdateResource = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            if (formData.description) formDataToSend.append('description', formData.description);
            formDataToSend.append('resource_type', formData.resource_type);

            if (formData.resource_type === 'link' && formData.url) {
                formDataToSend.append('url', formData.url);
            }
            if (formData.resource_type === 'file' && formData.file) {
                formDataToSend.append('file', formData.file);
            }

            const updated = await resourceService.updateResource(editingResource.id, formDataToSend);
            setResources(resources.map(r => r.id === updated.id ? updated : r));
            setEditingResource(null);
            setShowForm(false);
            setFormData({ name: '', description: '', resource_type: 'link', url: '', file: null });
        } catch (err) {
            console.error('Ошибка при обновлении ресурса:', err);
            alert('Не удалось обновить ресурс');
        }
    };

    const handleDeleteResource = async (resourceId, resourceName) => {
        if (window.confirm(`Удалить ресурс "${resourceName}"?`)) {
            try {
                await resourceService.deleteResource(resourceId);
                setResources(resources.filter(r => r.id !== resourceId));
            } catch (err) {
                console.error('Ошибка при удалении ресурса:', err);
                alert('Не удалось удалить ресурс');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setFormData(prev => ({ ...prev, file: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingResource(null);
        setFormData({ name: '', description: '', resource_type: 'link', url: '', file: null });
    };

    const isSelected = (resourceId) => {
        return selectedResourceIds.includes(resourceId);
    };

    const handleResourceClick = (resource) => {
        onSelectResource(resource);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>📎 Ресурсы</h2>
                    <button onClick={onClose} style={styles.closeButton}>✕</button>
                </div>

                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    style={styles.addButton}
                >
                    {showForm ? 'Отмена' : '+ Новый ресурс'}
                </button>

                {showForm && (
                    <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource} style={styles.form}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Название ресурса *"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Описание"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows="2"
                        />
                        <select
                            name="resource_type"
                            value={formData.resource_type}
                            onChange={handleChange}
                            style={styles.select}
                        >
                            <option value="link">Ссылка (URL)</option>
                            <option value="file">Файл</option>
                        </select>

                        {formData.resource_type === 'link' && (
                            <input
                                type="url"
                                name="url"
                                placeholder="https://..."
                                value={formData.url}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        )}

                        {formData.resource_type === 'file' && (
                            <input
                                type="file"
                                name="file"
                                onChange={handleChange}
                                style={styles.input}
                            />
                        )}

                        <button type="submit" style={styles.submitButton}>
                            {editingResource ? 'Обновить ресурс' : 'Сохранить ресурс'}
                        </button>
                    </form>
                )}

                {loading && <div>Загрузка...</div>}
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.list}>
                    {resources.map(resource => (
                        <div key={resource.id} style={styles.resourceItem}>
                            <div
                                style={{
                                    ...styles.resourceInfo,
                                    backgroundColor: isSelected(resource.id) ? '#e3f2fd' : 'transparent',
                                }}
                                onClick={() => handleResourceClick(resource)}
                            >
                                <strong>
                                    {resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}
                                </strong>
                                {resource.description && <span style={styles.detail}>📝 {resource.description}</span>}
                                {resource.resource_type === 'link' && resource.url && (
                                    <span style={styles.detail}>🔗 {resource.url}</span>
                                )}
                                {isSelected(resource.id) && <span style={styles.checkmark}>✓</span>}
                            </div>
                            <div style={styles.resourceActions}>
                                <button onClick={() => handleEditResource(resource)} style={styles.editButton} title="Редактировать">✏️</button>
                                <button onClick={() => handleDeleteResource(resource.id, resource.name)} style={styles.deleteButton} title="Удалить">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>

                {resources.length === 0 && !loading && (
                    <p style={styles.empty}>Нет ресурсов. Создайте первый ресурс!</p>
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
    select: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
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
    resourceItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        borderBottom: '1px solid #eee',
    },
    resourceInfo: {
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
    resourceActions: {
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

export default ResourceManager;