import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService';
import styles from './ResourceManager.module.css';

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
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>📎 Ресурсы</h2>
                    <button onClick={onClose} className={styles.closeButton}>✕</button>
                </div>

                <button
                    onClick={() => showForm ? resetForm() : setShowForm(true)}
                    className={styles.addButton}
                >
                    {showForm ? 'Отмена' : '+ Новый ресурс'}
                </button>

                {showForm && (
                    <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource} className={styles.form}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Название ресурса *"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Описание"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            rows="2"
                        />
                        <select
                            name="resource_type"
                            value={formData.resource_type}
                            onChange={handleChange}
                            className={styles.select}
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
                                className={styles.input}
                            />
                        )}

                        {formData.resource_type === 'file' && (
                            <input
                                type="file"
                                name="file"
                                onChange={handleChange}
                                className={styles.input}
                            />
                        )}

                        <button type="submit" className={styles.submitButton}>
                            {editingResource ? 'Обновить ресурс' : 'Сохранить ресурс'}
                        </button>
                    </form>
                )}

                {loading && <div className={styles.loading}>Загрузка...</div>}
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.list}>
                    {resources.map(resource => (
                        <div key={resource.id} className={styles.resourceItem}>
                            <div
                                className={styles.resourceInfo}
                                className={{
                                    backgroundColor: isSelected(resource.id) ? '#e3f2fd' : 'transparent',
                                }}
                                onClick={() => handleResourceClick(resource)}
                            >
                                <strong>
                                    {resource.resource_type === 'link' ? '🔗' : '📄'} {resource.name}
                                </strong>
                                {resource.description && <span className={styles.detail}>📝 {resource.description}</span>}
                                {resource.resource_type === 'link' && resource.url && (
                                    <span className={styles.detail}>🔗 {resource.url}</span>
                                )}
                                {isSelected(resource.id) && <span className={styles.checkmark}>✓</span>}
                            </div>
                            <div className={styles.resourceActions}>
                                <button onClick={() => handleEditResource(resource)} className={styles.editButton} title="Редактировать">✏️</button>
                                <button onClick={() => handleDeleteResource(resource.id, resource.name)} className={styles.deleteButton} title="Удалить">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>

                {resources.length === 0 && !loading && (
                    <p className={styles.empty}>Нет ресурсов. Создайте первый ресурс!</p>
                )}
            </div>
        </div>
    );
}

export default ResourceManager;