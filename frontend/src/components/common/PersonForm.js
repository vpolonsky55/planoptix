import React from 'react';
import styles from './PersonForm.module.css'

function PersonForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <input
                type="text"
                name="first_name"
                placeholder="Имя *"
                value={formData.first_name}
                onChange={onChange}
                className={styles.input}
                required
            />
            <input
                type="text"
                name="last_name"
                placeholder="Фамилия"
                value={formData.last_name || ''}
                onChange={onChange}
                className={styles.input}
            />
            <input
                type="tel"
                name="phone"
                placeholder="Телефон"
                value={formData.phone || ''}
                onChange={onChange}
                className={styles.input}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={onChange}
                className={styles.input}
            />
            <textarea
                name="notes"
                placeholder="Заметки"
                value={formData.notes || ''}
                onChange={onChange}
                className={styles.textarea}
                rows="3"
            />
            <div className={styles.buttons}>
                <button type="submit" className={styles.submitButton}>
                    {isEditing ? 'Обновить контакт' : 'Сохранить контакт'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Отмена
                </button>
            </div>
        </form>
    );
}



export default PersonForm;