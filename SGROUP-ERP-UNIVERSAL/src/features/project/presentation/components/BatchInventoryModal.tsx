import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform, Alert } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGButton } from '../../../shared/ui/components';
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Layers, Grid3x3, Eye } from 'lucide-react-native';
import { useGenerateInventory } from '../../application/hooks/useProjects';

interface Props {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
}

export function BatchInventoryModal({ visible, onClose, projectId, projectName }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const generateMutation = useGenerateInventory();

  const [step, setStep] = useState(1);
  const [blocks, setBlocks] = useState<string[]>(['A']);
  const [newBlock, setNewBlock] = useState('');
  const [fromFloor, setFromFloor] = useState('1');
  const [toFloor, setToFloor] = useState('10');
  const [unitsPerFloor, setUnitsPerFloor] = useState('4');
  const [codePattern, setCodePattern] = useState('{block}-{floor}{unit}');
  const [defaultArea, setDefaultArea] = useState('65');
  const [defaultPrice, setDefaultPrice] = useState('3.5');
  const [defaultBedrooms, setDefaultBedrooms] = useState('2');

  const addBlock = () => {
    const b = newBlock.trim().toUpperCase();
    if (b && !blocks.includes(b)) {
      setBlocks(prev => [...prev, b]);
      setNewBlock('');
    }
  };

  const removeBlock = (b: string) => {
    setBlocks(prev => prev.filter(x => x !== b));
  };

  const totalUnits = useMemo(() => {
    const floors = Math.max(0, parseInt(toFloor) - parseInt(fromFloor) + 1);
    const units = parseInt(unitsPerFloor) || 0;
    return blocks.length * floors * units;
  }, [blocks, fromFloor, toFloor, unitsPerFloor]);

  // Preview data for step 3
  const previewData = useMemo(() => {
    const pattern = codePattern || '{block}-{floor}{unit}';
    const from = parseInt(fromFloor) || 1;
    const to = parseInt(toFloor) || 1;
    const uPerFloor = parseInt(unitsPerFloor) || 1;

    const data: { block: string; floors: { floor: number; codes: string[] }[] }[] = [];

    for (const block of blocks) {
      const floors: { floor: number; codes: string[] }[] = [];
      for (let floor = to; floor >= from; floor--) {
        const codes: string[] = [];
        for (let unit = 1; unit <= uPerFloor; unit++) {
          const floorPad = String(floor).padStart(2, '0');
          const unitPad = String(unit).padStart(2, '0');
          codes.push(
            pattern.replace('{block}', block).replace('{floor}', floorPad).replace('{unit}', unitPad)
          );
        }
        floors.push({ floor, codes });
      }
      data.push({ block, floors });
    }
    return data;
  }, [blocks, fromFloor, toFloor, unitsPerFloor, codePattern]);

  const handleSubmit = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        projectId,
        params: {
          blocks,
          fromFloor: parseInt(fromFloor) || 1,
          toFloor: parseInt(toFloor) || 1,
          unitsPerFloor: parseInt(unitsPerFloor) || 1,
          codePattern: codePattern || '{block}-{floor}{unit}',
          defaultArea: parseFloat(defaultArea) || 0,
          defaultPrice: parseFloat(defaultPrice) || 0,
          defaultBedrooms: parseInt(defaultBedrooms) || 0,
        },
      }) as { created: number; skipped: number; total: number };
      const msg = `âœ… ÄÃ£ táº¡o ${result.created} sáº£n pháº©m thÃ nh cÃ´ng!\n${result.skipped > 0 ? `âš ï¸ Bá» qua ${result.skipped} mÃ£ Ä‘Ã£ tá»“n táº¡i.` : ''}\nTá»•ng sáº£n pháº©m: ${result.total}`;
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('ThÃ nh cÃ´ng', msg);
      }
      onClose();
      setStep(1);
    } catch (e: any) {
      const errMsg = e?.message || 'Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh';
      if (Platform.OS === 'web') {
        alert('âŒ Lá»—i: ' + errMsg);
      } else {
        Alert.alert('Lá»—i', errMsg);
      }
    }
  };

  const canProceedStep1 = blocks.length > 0 && parseInt(fromFloor) >= 0 && parseInt(toFloor) >= parseInt(fromFloor);
  const canProceedStep2 = parseInt(unitsPerFloor) > 0;

  const inputStyle = (hasError = false): any => ({
    height: 44, borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    color: colors.text,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderColor: hasError ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  });

  const renderStep1 = () => (
    <View style={{ gap: 20 }}>
      {/* Blocks */}
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>BLOCK / TÃ’A</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {blocks.map(b => (
            <View key={b} style={[styles.tag, { backgroundColor: '#10b981', borderColor: '#10b981' }]}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{b}</Text>
              <TouchableOpacity onPress={() => removeBlock(b)} style={{ marginLeft: 6 }}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[inputStyle(), { flex: 1 }]}
            placeholder="Nháº­p tÃªn Block (VD: C)"
            placeholderTextColor={colors.textTertiary}
            value={newBlock}
            onChangeText={setNewBlock}
            onSubmitEditing={addBlock}
          />
          <SGButton title="ThÃªm" size="sm" onPress={addBlock} icon={<Plus size={16} color="#fff" />} />
        </View>
      </View>

      {/* Floor Range */}
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Sá» Táº¦NG</Text>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sublabel, { color: colors.textTertiary }]}>Tá»« táº§ng</Text>
            <TextInput style={inputStyle()} value={fromFloor} onChangeText={setFromFloor} keyboardType="number-pad" />
          </View>
          <Text style={{ color: colors.textSecondary, fontWeight: '800', fontSize: 18, marginTop: 20 }}>â†’</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sublabel, { color: colors.textTertiary }]}>Äáº¿n táº§ng</Text>
            <TextInput style={inputStyle()} value={toFloor} onChangeText={setToFloor} keyboardType="number-pad" />
          </View>
        </View>
      </View>

      <View style={[styles.summaryBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5', borderColor: isDark ? 'rgba(16,185,129,0.2)' : '#a7f3d0' }]}>
        <Text style={{ color: '#059669', fontWeight: '800', fontSize: 14 }}>
          ðŸ“Š {blocks.length} Block Ã— {Math.max(0, (parseInt(toFloor) || 0) - (parseInt(fromFloor) || 0) + 1)} Táº§ng
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ gap: 20 }}>
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Sá» CÄ‚N / Táº¦NG</Text>
        <TextInput style={inputStyle()} value={unitsPerFloor} onChangeText={setUnitsPerFloor} keyboardType="number-pad" placeholder="4" placeholderTextColor={colors.textTertiary} />
      </View>

      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>MáºªU MÃƒ CÄ‚N</Text>
        <TextInput style={inputStyle()} value={codePattern} onChangeText={setCodePattern} placeholder="{block}-{floor}{unit}" placeholderTextColor={colors.textTertiary} />
        <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 6 }}>
          {'{block}'} = TÃªn Block, {'{floor}'} = Sá»‘ táº§ng (01, 02...), {'{unit}'} = Sá»‘ cÄƒn (01, 02...)
        </Text>
        <Text style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: '700' }}>
          VD: {codePattern.replace('{block}', blocks[0] || 'A').replace('{floor}', '05').replace('{unit}', '03')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>DIá»†N TÃCH (mÂ²)</Text>
          <TextInput style={inputStyle()} value={defaultArea} onChangeText={setDefaultArea} keyboardType="decimal-pad" placeholder="65" placeholderTextColor={colors.textTertiary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>GIÃ BÃN (Tá»¶)</Text>
          <TextInput style={inputStyle()} value={defaultPrice} onChangeText={setDefaultPrice} keyboardType="decimal-pad" placeholder="3.5" placeholderTextColor={colors.textTertiary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>PHÃ’NG NGá»¦</Text>
          <TextInput style={inputStyle()} value={defaultBedrooms} onChangeText={setDefaultBedrooms} keyboardType="number-pad" placeholder="2" placeholderTextColor={colors.textTertiary} />
        </View>
      </View>

      <View style={[styles.summaryBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff', borderColor: isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe' }]}>
        <Text style={{ color: '#2563eb', fontWeight: '800', fontSize: 14 }}>
          ðŸ—ï¸ Sáº½ táº¡o tá»•ng cá»™ng {totalUnits} sáº£n pháº©m
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={{ gap: 16 }}>
      <View style={[styles.summaryBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5', borderColor: isDark ? 'rgba(16,185,129,0.2)' : '#a7f3d0' }]}>
        <Text style={{ color: '#059669', fontWeight: '900', fontSize: 16 }}>
          âœ… Xem trÆ°á»›c: {totalUnits} sáº£n pháº©m
        </Text>
        <Text style={{ color: '#059669', fontWeight: '600', fontSize: 12, marginTop: 4 }}>
          {blocks.length} Block Ã— {Math.max(0, (parseInt(toFloor) || 0) - (parseInt(fromFloor) || 0) + 1)} Táº§ng Ã— {unitsPerFloor} CÄƒn/Táº§ng
        </Text>
      </View>

      <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
        {previewData.map(blockData => (
          <View key={blockData.block} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text, marginBottom: 8 }}>
              ðŸ¢ Block {blockData.block}
            </Text>
            {blockData.floors.map(floorData => (
              <View key={floorData.floor} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                <View style={{ 
                  width: 48, paddingVertical: 4, borderRadius: 6,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textTertiary }}>Táº¦NG</Text>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: colors.text }}>{floorData.floor}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 }}>
                  {floorData.codes.map(code => (
                    <View key={code} style={[styles.previewCell, {
                      backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',
                      borderColor: '#10b981',
                    }]}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#059669' }}>{code}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const stepTitles = ['Thiáº¿t láº­p Block & Táº§ng', 'Cáº¥u hÃ¬nh Sáº£n pháº©m', 'XÃ¡c nháº­n & Táº¡o'];
  const stepIcons = [Layers, Grid3x3, Eye];

  const content = (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.modal, {
        backgroundColor: isDark ? '#0f172a' : '#fff',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      }]}>
        {/* Header */}
        <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]}>
          <View>
            <Text style={[typography.h3, { color: colors.text }]}>ðŸ—ï¸ Táº¡o Báº£ng HÃ ng Nhanh</Text>
            {projectName && (
              <Text style={{ fontSize: 13, color: '#10b981', fontWeight: '700', marginTop: 4 }}>
                {projectName}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, gap: 8 }}>
          {[1, 2, 3].map(s => {
            const StepIcon = stepIcons[s - 1];
            const isActive = step === s;
            const isDone = step > s;
            return (
              <View key={s} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  width: 32, height: 32, borderRadius: 10,
                  backgroundColor: isDone ? '#10b981' : (isActive ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9')),
                  borderWidth: isActive ? 2 : 0,
                  borderColor: '#10b981',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <StepIcon size={16} color={isDone ? '#fff' : (isActive ? '#10b981' : colors.textTertiary)} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: isActive ? '800' : '600', color: isActive ? colors.text : colors.textTertiary, flex: 1 }} numberOfLines={1}>
                  {stepTitles[s - 1]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]}>
          {step > 1 && (
            <SGButton
              title="Quay láº¡i"
              variant="outline"
              onPress={() => setStep(s => s - 1)}
              icon={<ChevronLeft size={16} color={isDark ? '#E2E8F0' : '#475569'} />}
              style={{ marginRight: 12 }}
            />
          )}
          <View style={{ flex: 1 }} />
          {step < 3 ? (
            <SGButton
              title="Tiáº¿p tá»¥c"
              onPress={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              icon={<ChevronRight size={16} color="#fff" />}
            />
          ) : (
            <SGButton
              title={generateMutation.isPending ? 'Äang táº¡o...' : `Táº¡o ${totalUnits} Sáº£n pháº©m`}
              onPress={handleSubmit}
              disabled={generateMutation.isPending}
              style={{ backgroundColor: '#10b981' }}
            />
          )}
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    if (!visible) return null;
    return content;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    ...(Platform.OS === 'web' ? { position: 'fixed' } as any : {}),
  },
  modal: {
    width: '92%',
    maxWidth: 720,
    maxHeight: '88%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 24px 80px rgba(0,0,0,0.3)' } as any : { elevation: 20 }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
  },
  label: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
    marginBottom: 8, textTransform: 'uppercase',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  sublabel: {
    fontSize: 11, fontWeight: '600', marginBottom: 4,
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
  },
  summaryBox: {
    padding: 16, borderRadius: 12, borderWidth: 1,
  },
  previewCell: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1.5,
  },
});
