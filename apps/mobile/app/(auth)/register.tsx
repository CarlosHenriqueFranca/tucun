import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../src/constants";
import { useAuth } from "../../src/hooks/use-auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  function update(key: keyof typeof form) {
    return (value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      whatsapp: form.whatsapp.trim() || undefined,
    });
    if (result.success) {
      router.replace("/(tabs)/map");
    }
  }

  const isValid = form.name.length > 2 && form.email.includes("@") && form.password.length >= 6;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🎣</Text>
            <Text style={styles.logoText}>TUCUN</Text>
          </View>

          {/* Trial Badge */}
          <View style={styles.trialBadge}>
            <Text style={styles.trialEmoji}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.trialTitle}>7 dias completamente grátis</Text>
              <Text style={styles.trialSubtitle}>
                Sem cartão de crédito · Cancele quando quiser
              </Text>
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Criar conta</Text>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Text style={styles.errorDismiss}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={update("name")}
                placeholder="Seu nome"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={update("email")}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={form.password}
                  onChangeText={update("password")}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* WhatsApp (optional) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                WhatsApp{" "}
                <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                  (opcional)
                </Text>
              </Text>
              <TextInput
                style={styles.input}
                value={form.whatsapp}
                onChangeText={update("whatsapp")}
                placeholder="+55 69 99999-9999"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, (!isValid || loading) && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  Criar Conta — 7 dias grátis 🎣
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.terms}>
              Ao criar conta, você concorda com os{" "}
              <Text style={{ color: COLORS.secondary }}>Termos de Uso</Text> e{" "}
              <Text style={{ color: COLORS.secondary }}>Política de Privacidade</Text>.
            </Text>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Fazer login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoEmoji: { fontSize: 48 },
  logoText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 6,
    marginTop: 6,
  },
  trialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(64,145,108,0.15)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 16,
  },
  trialEmoji: { fontSize: 28 },
  trialTitle: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "700",
  },
  trialSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    flex: 1,
  },
  errorDismiss: {
    color: COLORS.danger,
    fontSize: 14,
    paddingLeft: 8,
  },
  fieldGroup: { gap: 8 },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eyeBtn: { paddingHorizontal: 4 },
  eyeIcon: { fontSize: 20 },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  terms: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: { color: COLORS.textMuted, fontSize: 14 },
  loginLink: { color: COLORS.secondary, fontSize: 14, fontWeight: "700" },
});
