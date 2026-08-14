import React from 'react';
import styles from './PlaceForm.module.css'

function PlaceForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <input
                type="text"
                name="name"
                placeholder="Название места *"
                value={formData.name}
                onChange={onChange}
                className={styles.input}
                required
            />
            <input
                type="text"
                name="address"
                placeholder="Адрес"
                value={formData.address}
                onChange={onChange}
                className={styles.input}
            />
            <textarea
                name="notes"
                placeholder="Заметки"
                value={formData.notes || ''}
                onChange={onChange}
                className={styles.textarea}
                rows="2"
            />
            <div className={styles.buttons}>
                <button type="submit" className={styles.submitButton}>
                    {isEditing ? 'Обновить место' : 'Сохранить место'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Отмена
                </button>
            </div>
        </form>
    );
}



export default PlaceForm;