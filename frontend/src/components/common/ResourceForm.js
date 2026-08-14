import React from 'react';
import styles from './ResourceForm.module.css';


function ResourceForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <input
                type="text"
                name="name"
                placeholder="Название ресурса *"
                value={formData.name}
                onChange={onChange}
                className={styles.input}
                required
            />
            <textarea
                name="description"
                placeholder="Описание"
                value={formData.description || ''}
                onChange={onChange}
                className={styles.textarea}
                rows="2"
            />
            <select
                name="resource_type"
                value={formData.resource_type}
                onChange={onChange}
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
                    value={formData.url || ''}
                    onChange={onChange}
                    className={styles.input}
                />
            )}

            {formData.resource_type === 'file' && (
                <input
                    type="file"
                    name="file"
                    onChange={onChange}
                    className={styles.input}
                />
            )}

            <div className={styles.buttons}>
                <button type="submit" className={styles.submitButton}>
                    {isEditing ? 'Обновить ресурс' : 'Сохранить ресурс'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Отмена
                </button>
            </div>
        </form>
    );
}



export default ResourceForm;