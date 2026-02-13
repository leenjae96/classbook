package com.leenjae.global.common;

import com.leenjae.domain.StudentRole;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StudentRoleConverter implements AttributeConverter<StudentRole, Integer> {
    @Override
    public Integer convertToDatabaseColumn(StudentRole attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getCode();
    }

    @Override
    public StudentRole convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return null;
        }
        return StudentRole.byCode(dbData);
    }

}
