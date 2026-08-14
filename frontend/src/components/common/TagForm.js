import React from 'react';
import styles from './TagForm.module.css';

function TagForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
        <form onSubmit={onSubmit} className={styles.form}>
            <input
                type="text"
                name="name"
                placeholder="Название тега *"
                value={formData.name}
                onChange={onChange}
                className={styles.input}
                required
            />
            <div className={styles.colorRow}>
                <label className={styles.colorLabel}>Цвет:</label>
                <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={onChange}
                    className={styles.colorInput}
                />
                <span className={{ ...styles.colorPreview, backgroundColor: formData.color }}></span>
            </div>
            <div className={styles.buttons}>
                <button type="submit" className={styles.submitButton}>
                    {isEditing ? 'Обновить тег' : 'Сохранить тег'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Отмена
                </button>
            </div>
        </form>
    );
}



export default TagForm;