// frontend/src/components/common/PlaceForm.js
import React from 'react';

function PlaceForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} style={styles.form}>
            <input
                type="text"
                name="name"
                placeholder="Название места *"
                value={formData.name}
                onChange={onChange}
                style={styles.input}
                required
            />
            <input
                type="text"
                name="address"
                placeholder="Адрес"
                value={formData.address}
                onChange={onChange}
                style={styles.input}
            />
            <textarea
                name="notes"
                placeholder="Заметки"
                value={formData.notes || ''}
                onChange={onChange}
                style={styles.textarea}
                rows="2"
            />
            <div style={styles.buttons}>
                <button type="submit" style={styles.submitButton}>
                    {isEditing ? 'Обновить место' : 'Сохранить место'}
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

export default PlaceForm;