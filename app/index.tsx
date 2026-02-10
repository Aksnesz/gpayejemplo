import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
const API_URL = process.env.IP_SV || "http://localhost:3000";

function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const initializePaymentSheet = async () => {
    try {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { clientSecret } = await response.json();

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Mi Tienda Test",
        googlePay: {
          merchantCountryCode: "MX",
          testEnv: true, // Modo de prueba
          currencyCode: "MXN",
        },
        allowsDelayedPaymentMethods: false,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setReady(true);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
      console.error(error);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const handlePayment = async () => {
    if (!ready) {
      Alert.alert("Espera", "El sistema de pago se está inicializando");
      return;
    }

    setLoading(true);

    const { error } = await presentPaymentSheet();

    setLoading(false);

    if (error) {
      Alert.alert("Pago cancelado", error.message);
    } else {
      Alert.alert("¡Éxito!", "Tu pago de $1 MXN se procesó correctamente");
      setReady(false);
      initializePaymentSheet();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Comprar</Text>
        <Text style={styles.price}>$1</Text>
        <Text style={styles.currency}>MXN</Text>

        <TouchableOpacity
          style={[styles.button, (!ready || loading) && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={!ready || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {ready ? "Pagar con Google Pay" : "Cargando..."}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>🔒 Pago seguro - Modo de prueba</Text>
      </View>
    </View>
  );
}

export default function Index() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentScreen />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  price: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#000",
  },
  currency: {
    fontSize: 20,
    color: "#666",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 250,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  note: {
    marginTop: 30,
    color: "#999",
    fontSize: 13,
  },
});
