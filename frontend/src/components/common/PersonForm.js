// frontend/src/components/common/PersonForm.js
import React from 'react';

function PersonForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} style={styles.form}>
            <input
                type="text"
                name="first_name"
                placeholder="Имя *"
                value={formData.first_name}
                onChange={onChange}
                style={styles.input}
                required
            />
            <input
                type="text"
                name="last_name"
                placeholder="Фамилия"
                value={formData.last_name || ''}
                onChange={onChange}
                style={styles.input}
            />
            <input
                type="tel"
                name="phone"
                placeholder="Телефон"
                value={formData.phone || ''}
                onChange={onChange}
                style={styles.input}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={onChange}
                style={styles.input}
            />
            <textarea
                name="notes"
                placeholder="Заметки"
                value={formData.notes || ''}
                onChange={onChange}
                style={styles.textarea}
                rows="3"
            />
            <div style={styles.buttons}>
                <button type="submit" style={styles.submitButton}>
                    {isEditing ? 'Обновить контакт' : 'Сохранить контакт'}
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

export default PersonForm;