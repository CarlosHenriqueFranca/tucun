import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../src/constants";
import { useAuth } from "../../src/hooks/use-auth";

const RESEND_TIMEOUT = 60;

export default function OTPScreen() {
  const router = useRouter();
  const { requestOtp, verifyOtp, loading, error, clearError } = useAuth();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCountdown() {
    setCountdown(RESEND_TIMEOUT);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode() {
    const result = await requestOtp({ phone: phone.trim() });
    if (result.success) {
      setStep("code");
      startCountdown();
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    const result = await requestOtp({ phone: phone.trim() });
    if (result.success) startCountdown();
  }

  async function handleVerify() {
    const result = await verifyOtp({
      phone: phone.trim(),
      code: code.trim(),
    });
    if (result.success) {
      router.replace("/(tabs)/map");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === "code") {
              setStep("phone");
              setCode("");
              clearError();
            } else {
              router.back();
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Logo */}
          <Text style={styles.logoEmoji}>💬</Text>

          <Text style={styles.title}>
            {step === "phone" ? "Entrar via WhatsApp" : "Código enviado!"}
          </Text>
          <Text style={styles.subtitle}>
            {step === "phone"
              ? "Enviaremos um código de verificação para o seu WhatsApp."
              : `Código de 6 dígitos enviado para\n${phone}`}
          </Text>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === "phone" ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Número do WhatsApp</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+55 69 99999-9999"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!phone || loading) && { opacity: 0.6 },
                ]}
                onPress={handleSendCode}
                disabled={!phone || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Enviar Código</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Código de verificação</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="• • • • • •"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />
              </View>

              {/* Resend */}
              <TouchableOpacity
                onPress={handleResend}
                disabled={countdown > 0}
                style={styles.resendBtn}
              >
                <Text
                  style={[
                    styles.resendText,
                    countdown > 0 && { color: COLORS.textMuted },
                  ]}
                >
                  {countdown > 0
                    ? `Reenviar em ${countdown}s`
                    : "Reenviar código"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (code.length < 6 || loading) && { opacity: 0.6 },
                ]}
                onPress={handleVerify}
                disabled={code.length < 6 || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verificar</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backIcon: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: "700",
  },
  backText: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },
  logoEmoji: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    textAlign: "center",
  },
  fieldGroup: { gap: 8 },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  codeInput: {
    fontSize: 28,
    letterSpacing: 12,
    fontWeight: "700",
    paddingVertical: 20,
  },
  resendBtn: {
    alignItems: "center",
  },
  resendText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
