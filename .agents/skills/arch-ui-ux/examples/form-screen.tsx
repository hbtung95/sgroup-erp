/**
 * Form Screen — SGDS Example
 *
 * Complete form screen with validation, dark/light theme support,
 * glass card sections, and animated submission. Demonstrates
 * proper form composition using SG* components.
 *
 * Usage: Reference for building form-based screens (create/edit).
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme, typography, spacing, radius, sgds } from '@/shared/theme/theme';
import { v7 as uuidv7 } from 'uuid';

// SG* Components
import { SGPageContainer } from '@/shared/ui/components/SGPageContainer';
import { SGPageHeader } from '@/shared/ui/components/SGPageHeader';
import { SGInput } from '@/shared/ui/components/SGInput';
import { SGTextArea } from '@/shared/ui/components/SGTextArea';
import { SGSelect } from '@/shared/ui/components/SGSelect';
import { SGCurrencyInput } from '@/shared/ui/components/SGCurrencyInput';
import { SGDatePicker } from '@/shared/ui/components/SGDatePicker';
import { SGButton } from '@/shared/ui/components/SGButton';
import { SGLoadingOverlay } from '@/shared/ui/components/SGLoadingOverlay';

// ─── Types ──────────────────────────────────────────
interface FormData {
  name: string;
  value: string;
  status: string;
  closeDate: Date | null;
  notes: string;
  clientName: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

// ─── Validation ─────────────────────────────────────
const validate = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Deal name is required';
  } else if (data.name.length < 3) {
    errors.name = 'Deal name must be at least 3 characters';
  }

  if (!data.value.trim() || Number(data.value.replace(/[^0-9]/g, '')) === 0) {
    errors.value = 'Deal value is required';
  }

  if (!data.status) {
    errors.status = 'Please select a status';
  }

  if (!data.clientName.trim()) {
    errors.clientName = 'Client name is required';
  }

  const phoneRegex = /^[0-9]{10,11}$/;
  if (data.phone && !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Invalid phone number';
  }

  return errors;
};

// ─── Status Options ─────────────────────────────────
const statusOptions = [
  { label: 'Prospecting', value: 'prospecting' },
  { label: 'Qualification', value: 'qualification' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Closed Won', value: 'closed_won' },
  { label: 'Closed Lost', value: 'closed_lost' },
];

// ─── Component ──────────────────────────────────────
export const FormScreen: React.FC = () => {
  const colors = useTheme();

  // ─── State ─────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    name: '',
    value: '',
    status: '',
    closeDate: null,
    notes: '',
    clientName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ─── Submit Animation ──────────────────────────
  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // ─── Handlers ──────────────────────────────────
  const updateField = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const markTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);

    if (Object.keys(validationErrors).length > 0) {
      // Shake animation on error
      buttonScale.value = withSequence(
        withTiming(1.02, { duration: 50 }),
        withSpring(1, { damping: 8, stiffness: 400 }),
      );
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      const deal = {
        id: uuidv7(),
        ...formData,
        createdAt: new Date().toISOString(),
      };

      // API call here: await api.post('/deals', deal);
      console.log('Created deal:', deal);

      // Success feedback
      buttonScale.value = withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 15 }),
      );

      // Navigate back or show success
      Alert.alert('Success', 'Deal created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create deal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // ─── Render ────────────────────────────────────
  return (
    <SGPageContainer>
      <SGPageHeader title="Create New Deal" showBack />

      {/* ─── Client Info Section ────────────────── */}
      <View style={[sgds.sectionBase({ colors }), styles.section]}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.base }]}>
          Client Information
        </Text>

        <SGInput
          label="Client Name"
          placeholder="Enter client name..."
          value={formData.clientName}
          onChangeText={(v) => updateField('clientName', v)}
          onBlur={() => markTouched('clientName')}
          error={touched.clientName ? errors.clientName : undefined}
        />

        <View style={{ height: spacing.md }} />

        <SGInput
          label="Phone Number"
          placeholder="0912 345 678"
          value={formData.phone}
          onChangeText={(v) => updateField('phone', v)}
          onBlur={() => markTouched('phone')}
          error={touched.phone ? errors.phone : undefined}
          keyboardType="phone-pad"
        />
      </View>

      {/* ─── Deal Details Section ───────────────── */}
      <View style={[sgds.sectionBase({ colors }), styles.section]}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.base }]}>
          Deal Details
        </Text>

        <SGInput
          label="Deal Name"
          placeholder="Enter deal name..."
          value={formData.name}
          onChangeText={(v) => updateField('name', v)}
          onBlur={() => markTouched('name')}
          error={touched.name ? errors.name : undefined}
        />

        <View style={{ height: spacing.md }} />

        <SGCurrencyInput
          label="Deal Value"
          value={formData.value}
          onChangeText={(v) => updateField('value', v)}
          currency="VND"
          error={touched.value ? errors.value : undefined}
        />

        <View style={{ height: spacing.md }} />

        <SGSelect
          label="Status"
          options={statusOptions}
          value={formData.status}
          onChange={(v) => updateField('status', v)}
          error={touched.status ? errors.status : undefined}
          placeholder="Select a stage..."
        />

        <View style={{ height: spacing.md }} />

        <SGDatePicker
          label="Expected Close Date"
          value={formData.closeDate}
          onChange={(v) => updateField('closeDate', v)}
        />
      </View>

      {/* ─── Notes Section ──────────────────────── */}
      <View style={[sgds.sectionBase({ colors }), styles.section]}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.base }]}>
          Notes
        </Text>

        <SGTextArea
          label="Additional Notes"
          placeholder="Any important details about this deal..."
          value={formData.notes}
          onChangeText={(v) => updateField('notes', v)}
          maxLength={500}
        />
      </View>

      {/* ─── Submit Button ──────────────────────── */}
      <Animated.View style={[styles.submitContainer, buttonStyle]}>
        <SGButton
          title="Create Deal"
          variant="primary"
          gradient={colors.gradientBrand}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          fullWidth
        />
      </Animated.View>

      {/* Full-screen loading overlay */}
      <SGLoadingOverlay visible={isSubmitting} message="Creating deal..." />
    </SGPageContainer>
  );
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  submitContainer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
});
