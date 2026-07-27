import React from 'react';

function ResourceForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} style={styles.form}>
            <input
                type="text"
                name="name"
                placeholder="Название ресурса *"
                value={formData.name}
                onChange={onChange}
                style={styles.input}
                required
            />
            <textarea
                name="description"
                placeholder="Описание"
                value={formData.description || ''}
                onChange={onChange}
                style={styles.textarea}
                rows="2"
            />
            <select
                name="resource_type"
                value={formData.resource_type}
                onChange={onChange}
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
                    value={formData.url || ''}
                    onChange={onChange}
                    style={styles.input}
                />
            )}

            {formData.resource_type === 'file' && (
                <input
                    type="file"
                    name="file"
                    onChange={onChange}
                    style={styles.input}
                />
            )}

            <div style={styles.buttons}>
                <button type="submit" style={styles.submitButton}>
                    {isEditing ? 'Обновить ресурс' : 'Сохранить ресурс'}
                </button>
                <button type="button" onClick={onCancel} style={styles.cancelButton}>
                    Отмена
                </button>
            </div>
        </form>
    );
}

const styles = {
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
    buttons: {
        display: 'flex',
        gap: '0.5rem',
    },
    submitButton: {
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

export default ResourceForm;