import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejo de formularios con validación
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} validationRules - Función que retorna las reglas de validación
 * @returns {Object} - Estado y funciones del formulario
 */
const useForm = (initialValues = {}, validationRules = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Valida un campo específico
   */
  const validateField = useCallback((name, value) => {
    const rules = validationRules();
    const fieldRules = rules[name];

    if (!fieldRules) return '';

    for (const rule of fieldRules) {
      const error = rule(value, values);
      if (error) return error;
    }

    return '';
  }, [validationRules, values]);

  /**
   * Valida todos los campos del formulario
   */
  const validateForm = useCallback(() => {
    const rules = validationRules();
    const newErrors = {};

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField, validationRules, values]);

  /**
   * Maneja el cambio de valor de un input
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validación en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);

  /**
   * Maneja cuando un campo pierde el foco
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault();
      
      // Marcar todos los campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Validar formulario
      const isValid = validateForm();

      if (!isValid) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        // El error se maneja en el componente
        console.error('Error en submit:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateForm]);

  /**
   * Resetea el formulario a sus valores iniciales
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Establece valores del formulario manualmente
   */
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  /**
   * Establece un error específico manualmente
   */
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  /**
   * Limpia todos los errores
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
    setFieldError,
    clearErrors,
    validateForm,
    isValid: Object.keys(errors).length === 0
  };
};

export default useForm;