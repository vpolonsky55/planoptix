// frontend/src/components/common/TagForm.js
import React from 'react';

function TagForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} style={styles.form}>
            <input
                type="text"
                name="name"
                placeholder="Название тега *"
                value={formData.name}
                onChange={onChange}
                style={styles.input}
                required
            />
            <div style={styles.colorRow}>
                <label style={styles.colorLabel}>Цвет:</label>
                <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={onChange}
                    style={styles.colorInput}
                />
                <span style={{ ...styles.colorPreview, backgroundColor: formData.color }}></span>
            </div>
            <div style={styles.buttons}>
                <button type="submit" style={styles.submitButton}>
                    {isEditing ? 'Обновить тег' : 'Сохранить тег'}
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

export default TagForm;