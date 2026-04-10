import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { COLORS, SPOT_TYPES, SpotTypeId } from "../constants";
import { api } from "../lib/api";

interface Props {
  visible: boolean;
  latitude: number;
  longitude: number;
  onClose: () => void;
  onCreated: (spot: { id: string; name: string; type: SpotTypeId }) => void;
}

export function CreateSpotSheet({ visible, latitude, longitude, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<SpotTypeId>("ponto_de_pesca");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert("Atenção", "Digite o nome do ponto.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: { id: string; name: string; type: SpotTypeId } }>(
        "/spots",
        { name: name.trim(), description: description.trim() || undefined, type, latitude, longitude, city: city.trim() || undefined }
      );
      if (res.data.success) {
        onCreated(res.data.data);
        setName("");
        setDescription("");
        setType("ponto_de_pesca");
        setCity("");
        onClose();
      }
    } catch {
      Alert.alert("Erro", "Não foi possível criar o ponto. Verifique sua assinatura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>📍 Novo Ponto</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.coordsText}>
            📌 {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type selector */}
            <Text style={styles.label}>Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {SPOT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, type === t.id && { backgroundColor: t.color, borderColor: t.color }]}
                  onPress={() => setType(t.id)}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, type === t.id && styles.typeLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Name */}
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Rio Madeira — Porto Velho"
              placeholderTextColor={COLORS.textMuted}
              maxLength={255}
            />

            {/* Description */}
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Dicas de isca, melhor horário..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            {/* City */}
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Porto Velho"
              placeholderTextColor={COLORS.textMuted}
              maxLength={255}
            />

            <TouchableOpacity
              style={[styles.createBtn, loading && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createBtnText}>✓ Criar Ponto</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "90%",
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  close: { color: COLORS.textMuted, fontSize: 20, padding: 4 },
  coordsText: { color: COLORS.textMuted, fontSize: 12, marginBottom: 16 },
  label: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  typeRow: { marginBottom: 4 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  typeLabelActive: { color: "#fff" },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  inputMultiline: { height: 90, textAlignVertical: "top" },
  createBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
