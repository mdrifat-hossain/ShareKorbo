import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import Sidebar from "../components/Sidebar";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// QR code display library
import QRCode from "react-native-qrcode-svg";

import { CameraView, useCameraPermissions } from "expo-camera";

import { BASE_URL } from "../utils/config";

// ─────────────────────────────────────────────────────────────────────────────
// QR DISPLAY MODAL
// Shows a QR code that the other party needs to scan
// ─────────────────────────────────────────────────────────────────────────────
interface QRModalProps {
  visible: boolean;
  qrPayload: string;          // JSON string encoded in QR
  title: string;
  subtitle: string;
  onClose: () => void;
}

function QRModal({ visible, qrPayload, title, subtitle, onClose }: QRModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.qrModalCard}>
          {/* Header */}
          <View style={styles.qrModalHeader}>
            <View style={styles.qrIconBadge}>
              <MaterialIcons name="qr-code-2" size={28} color="#ffffff" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.qrModalTitle}>{title}</Text>
          <Text style={styles.qrModalSubtitle}>{subtitle}</Text>

          {/* QR Code */}
          <View style={styles.qrCodeWrapper}>
            {qrPayload ? (
              <QRCode
                value={qrPayload}
                size={220}
                color="#1a1a2e"
                backgroundColor="#ffffff"
                quietZone={12}
              />
            ) : null}
          </View>

          {/* Instruction */}
          <View style={styles.qrInstructionRow}>
            <MaterialIcons name="info-outline" size={16} color="#6b6fc4" />
            <Text style={styles.qrInstruction}>
              Show this QR code to the other person to scan
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeFullBtn}>
            <Text style={styles.closeFullBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QR SCANNER MODAL
// Uses expo-camera to scan a QR code, then calls verify endpoint
// ─────────────────────────────────────────────────────────────────────────────
interface ScannerModalProps {
  visible: boolean;
  scanType: "exchange" | "return";  // what we're verifying
  currentUserId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function ScannerModal({ visible, scanType, currentUserId, onClose, onSuccess }: ScannerModalProps) {
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || scanning) return;
    setScanned(true);
    setScanning(true);
    setErrorMsg("");

    try {
      const payload = JSON.parse(data);

      let endpoint = "";
      let body: any = {};

      if (scanType === "exchange") {
        // Client scans owner's exchange QR
        endpoint = `${BASE_URL}/listing/verify-exchange-qr`;
        body = {
          token: payload.token,
          requester_id: payload.requester_id,
          request_id: payload.request_id,
          scanner_id: parseInt(currentUserId),
        };
      } else {
        // Owner scans client's return QR
        endpoint = `${BASE_URL}/listing/verify-return-qr`;
        body = {
          token: payload.token,
          owner_id: payload.owner_id,
          request_id: payload.request_id,
          scanner_id: parseInt(currentUserId),
        };
      }

      const response = await axios.post(endpoint, body);

      if (response.data.error) {
        setErrorMsg(response.data.error);
        setScanning(false);
        setScanned(false);
      } else {
        onSuccess(response.data.message || "Verified successfully!");
        onClose();
      }
    } catch (e: any) {
      setErrorMsg("Invalid QR code or network error.");
      setScanning(false);
      setScanned(false);
    }
  };

  const handleClose = () => {
    setScanned(false);
    setScanning(false);
    setErrorMsg("");
    onClose();
  };

  if (!CameraView) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalBackdrop}>
          <View style={styles.scannerErrorCard}>
            <MaterialIcons name="camera-alt" size={40} color="#6b6fc4" />
            <Text style={styles.scannerErrorTitle}>Camera not available</Text>
            <Text style={styles.scannerErrorBody}>
              Camera scanning is not available on this device or browser.
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeFullBtn}>
              <Text style={styles.closeFullBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.scannerContainer}>
        {/* Top bar */}
        <View style={styles.scannerTopBar}>
          <TouchableOpacity onPress={handleClose} style={styles.scannerCloseBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>
            {scanType === "exchange" ? "Scan Exchange QR" : "Scan Return QR"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Camera view */}
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <MaterialIcons name="camera-alt" size={64} color="#6b6fc4" />
            <Text style={styles.permissionText}>Camera permission is required to scan QR codes</Text>
            <TouchableOpacity
              onPress={requestPermission}
              style={styles.permissionBtn}
            >
              <Text style={styles.permissionBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        )}

        {/* Overlay frame */}
        {permission?.granted && (
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>

            <Text style={styles.scannerHint}>
              {scanType === "exchange"
                ? "Point at the owner's exchange QR code"
                : "Point at the client's return QR code"}
            </Text>

            {scanning && (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.scanningText}>Verifying...</Text>
              </View>
            )}

            {errorMsg !== "" && (
              <View style={styles.scanErrorBadge}>
                <MaterialIcons name="error-outline" size={18} color="#fff" />
                <Text style={styles.scanErrorText}>{errorMsg}</Text>
                <TouchableOpacity onPress={() => { setScanned(false); setErrorMsg(""); }}>
                  <Text style={styles.scanRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, message: string) => void;
  initialRating?: number;
  initialMessage?: string;
  isSubmitting: boolean;
  targetName: string;
}

function ReviewModal({ visible, onClose, onSubmit, initialRating = 5, initialMessage = "", isSubmitting, targetName }: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [message, setMessage] = useState(initialMessage);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (visible) {
      setRating(initialRating);
      setMessage(initialMessage);
    }
  }, [visible, initialRating, initialMessage]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.qrModalCard, { width: 340, backgroundColor: isDark ? "#2d3133" : "#ffffff" }]}>
          {/* Header */}
          <View style={styles.qrModalHeader}>
            <View style={[styles.qrIconBadge, { backgroundColor: "#2b3896" }]}>
              <MaterialIcons name="rate-review" size={24} color="#ffffff" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={isDark ? "#c5c5d4" : "#888"} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.qrModalTitle, { color: isDark ? "#ffffff" : "#1a1a2e" }]}>Rate your exchange</Text>
          <Text style={[styles.qrModalSubtitle, { color: isDark ? "#c5c5d4" : "#6b7280" }]}>Share your experience with {targetName}</Text>

          {/* Star selector */}
          <View className="flex-row justify-center items-center gap-2 my-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} className="p-1">
                <MaterialIcons
                  name={star <= rating ? "star" : "star-border"}
                  size={36}
                  color={star <= rating ? "#e0a900" : (isDark ? "#555" : "#ccc")}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Message input */}
          <View className="w-full mb-6">
            <Text className="text-xs font-bold text-on-surface-variant dark:text-[#c5c5d4] mb-2">Message (optional)</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tell others how it went..."
              placeholderTextColor={isDark ? "#666" : "#999"}
              multiline
              numberOfLines={4}
              maxLength={500}
              className="w-full p-3 rounded-xl border bg-surface-container-lowest dark:bg-[#191c1e] text-on-surface dark:text-white font-body"
              style={{
                borderColor: isDark ? "#3f4345" : "#e2e8f0",
                textAlignVertical: "top",
                height: 100,
              }}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl items-center justify-center bg-surface-container-low dark:bg-[#191c1e]"
            >
              <Text className="text-on-surface-variant dark:text-[#c5c5d4] font-bold">Skip / Ignore</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => onSubmit(rating, message)}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl items-center justify-center bg-primary dark:bg-[#bcc2ff]"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={isDark ? "#000c62" : "#ffffff"} />
              ) : (
                <Text className="text-white dark:text-[#000c62] font-bold">Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function ActivityScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isLg = width >= 1024;
  const isMd = width >= 768;
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [requestsReceived, setRequestsReceived] = useState<any[]>([]);
  const [requestsSent, setRequestsSent] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // QR Modal state
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [qrTitle, setQrTitle] = useState("");
  const [qrSubtitle, setQrSubtitle] = useState("");

  // Scanner Modal state
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanType, setScanType] = useState<"exchange" | "return">("exchange");

  // Review Modal state
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch all requests
  const fetchRequests = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        axios.get(`${BASE_URL}/listing/requests-received/${userId}`),
        axios.get(`${BASE_URL}/listing/requests-sent/${userId}`),
      ]);
      if (receivedRes.data && !receivedRes.data.error) {
        setRequestsReceived(receivedRes.data);
      }
      if (sentRes.data && !sentRes.data.error) {
        setRequestsSent(sentRes.data);
      }
    } catch (error) {
      console.log("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserAndFetch = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        setCurrentUserId(userId);
        await fetchRequests(userId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error loading user:", error);
      setLoading(false);
    }
  }, [fetchRequests]);

  useEffect(() => {
    loadUserAndFetch();

    const unsubscribe = navigation.addListener?.("focus", loadUserAndFetch);
    return unsubscribe;
  }, [loadUserAndFetch, navigation]);

  // ── Handle Approve ──────────────────────────────────────────────────────────
  const handleApprove = async (requestId: number) => {
    try {
      const response = await axios.post(`${BASE_URL}/listing/approve-request/${requestId}`);
      if (response.data.error) {
        Alert.alert("Notice", response.data.error);
      } else {
        Alert.alert("Success", "Request approved successfully!");
        if (currentUserId) fetchRequests(currentUserId);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to approve request.");
    }
  };

  // ── Handle Reject ───────────────────────────────────────────────────────────
  const handleReject = async (requestId: number) => {
    try {
      const response = await axios.post(`${BASE_URL}/listing/reject-request/${requestId}`);
      if (response.data.error) {
        Alert.alert("Notice", response.data.error);
      } else {
        Alert.alert("Success", "Request rejected successfully!");
        if (currentUserId) fetchRequests(currentUserId);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to reject request.");
    }
  };

  // ── Handle Cancel ───────────────────────────────────────────────────────────
  const handleCancel = async (requestId: number) => {
    Alert.alert(
      "Confirm Cancel",
      "Are you sure you want to cancel this request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(`${BASE_URL}/listing/cancel-request-by-id/${requestId}`);
              if (response.data.error) {
                Alert.alert("Notice", response.data.error);
              } else {
                Alert.alert("Success", "Request cancelled successfully!");
                if (currentUserId) fetchRequests(currentUserId);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to cancel request.");
            }
          },
        },
      ]
    );
  };

  // ── Generate Exchange QR (Owner side) ───────────────────────────────────────
  const handleGenerateExchangeQR = async (requestId: number, requesterName: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/listing/generate-exchange-qr/${requestId}`);
      if (response.data.error) {
        Alert.alert("Error", response.data.error);
        return;
      }
      const payload = JSON.stringify({
        token: response.data.token,
        requester_id: response.data.requester_id,
        request_id: response.data.request_id,
        type: "exchange",
      });
      setQrPayload(payload);
      setQrTitle("Exchange Verification QR");
      setQrSubtitle(`Ask ${requesterName} to scan this QR code to confirm item handover`);
      setQrModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to generate exchange QR code.");
    }
  };

  // ── Generate Return QR (Client side) ────────────────────────────────────────
  const handleGenerateReturnQR = async (requestId: number, ownerName: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/listing/generate-return-qr/${requestId}`);
      if (response.data.error) {
        Alert.alert("Error", response.data.error);
        return;
      }
      const payload = JSON.stringify({
        token: response.data.token,
        owner_id: response.data.owner_id,
        request_id: response.data.request_id,
        type: "return",
      });
      setQrPayload(payload);
      setQrTitle("Return Verification QR");
      setQrSubtitle(`Ask ${ownerName} to scan this QR code to confirm item return`);
      setQrModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to generate return QR code.");
    }
  };

  // ── Open Scanner (Client scans exchange / Owner scans return) ───────────────
  const handleOpenScanner = (type: "exchange" | "return") => {
    setScanType(type);
    setScannerVisible(true);
  };

  const handleScanSuccess = (message: string) => {
    Alert.alert("✅ Success", message);
    if (currentUserId) fetchRequests(currentUserId);
  };

  const handleQRModalClose = () => {
    setQrModalVisible(false);
    // Refresh after closing QR (other party may have scanned by now)
    if (currentUserId) fetchRequests(currentUserId);
  };

  // ── Handle Open Review Modal ────────────────────────────────────────────────
  const handleOpenReviewModal = (item: any) => {
    setSelectedRequest(item);
    setReviewModalVisible(true);
  };

  // ── Handle Submit Review ────────────────────────────────────────────────────
  const handleSubmitReview = async (rating: number, message: string) => {
    if (!selectedRequest || !currentUserId) return;
    setIsSubmittingReview(true);
    try {
      const response = await axios.post(`${BASE_URL}/listing/reviews`, {
        request_id: selectedRequest.request_id,
        reviewer_id: parseInt(currentUserId),
        rating: rating,
        message: message
      });
      
      if (response.data.error) {
        Alert.alert("Error", response.data.error);
      } else {
        Alert.alert("Success", "Review saved successfully!");
        setReviewModalVisible(false);
        fetchRequests(currentUserId);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ── Relative time ───────────────────────────────────────────────────────────
  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffMins < 1) return "• Just now";
      if (diffMins < 60) return `• ${diffMins}m ago`;
      if (diffHours < 24) return `• ${diffHours}h ago`;
      return `• ${diffDays}d ago`;
    } catch (e) {
      return "";
    }
  };

  // ── Status helpers ──────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending Approval", bg: "bg-tertiary-fixed dark:bg-[#5b3d00]", text: "text-on-tertiary-fixed dark:text-[#ffdeac]" };
      case "approved":
        return { label: "Approved", bg: "bg-secondary-fixed dark:bg-[#005048]", text: "text-on-secondary-fixed-variant dark:text-[#8df5e4]" };
      case "exchanged":
        return { label: "Exchanged ✓", bg: "bg-primary-fixed dark:bg-[#303c9a]", text: "text-on-primary-fixed dark:text-[#bcc2ff]" };
      case "return_pending":
        return { label: "Return Pending", bg: "bg-tertiary-fixed dark:bg-[#5b3d00]", text: "text-on-tertiary-fixed dark:text-[#ffdeac]" };
      case "returned":
        return { label: "Returned ✓✓", bg: "bg-secondary-fixed dark:bg-[#005048]", text: "text-on-secondary-fixed-variant dark:text-[#8df5e4]" };
      case "rejected":
        return { label: "Rejected", bg: "bg-error-container dark:bg-[#93000a]", text: "text-error dark:text-[#ffdad6]" };
      default:
        return { label: status, bg: "bg-surface-container dark:bg-[#2d3133]", text: "text-on-surface dark:text-[#f8f9fb]" };
    }
  };

  // Step index for workflow indicator (0-based)
  const getWorkflowStep = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "approved": return 1;
      case "exchanged": return 2;
      case "return_pending": return 3;
      case "returned": return 4;
      default: return 0;
    }
  };

  const currentRequests = activeTab === "received" ? requestsReceived : requestsSent;

  return (
    <View className="flex-1 bg-surface dark:bg-[#191c1e] overflow-hidden relative">
      <View className="flex-1 flex-col lg:flex-row w-full relative">
        <Sidebar
          activeRoute="Activity"
          onNavigate={(route) => (navigation.navigate as any)(route)}
        />

        {/* Content Wrapper */}
        <View className="flex-1 h-full w-full relative">
          <TopAppBar
            onLogout={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            }
          />

          {/* Main Content */}
          <ScrollView
            className="flex-1 w-full"
            contentContainerStyle={{
              paddingTop: insets.top > 0 ? insets.top + 80 : 96,
              paddingBottom: isLg ? 40 : (insets.bottom > 0 ? insets.bottom + 100 : 120),
              paddingHorizontal: isMd ? 24 : 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="max-w-[1024px] w-full mx-auto">
              {/* Editorial Header Section */}
              <View className="mb-10">
                <Text className="text-3xl md:text-4xl font-extrabold text-primary dark:text-[#bcc2ff] tracking-tight mb-2 font-headline">
                  Activity Exchange
                </Text>
                <Text className="text-lg text-on-surface-variant dark:text-[#c5c5d4] max-w-xl font-body">
                  Manage your collaborative requests and track shared resources across the campus ecosystem.
                </Text>
              </View>

              {/* Dynamic Tabs */}
              <View className="flex-row p-1 bg-surface-container-low dark:bg-[#2d3133] rounded-2xl mb-8 w-fit self-start">
                <TouchableOpacity
                  onPress={() => setActiveTab("received")}
                  style={
                    activeTab === "received"
                      ? {
                          backgroundColor: isDark ? "#191c1e" : "#ffffff",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 2,
                        }
                      : null
                  }
                  className="px-5 md:px-8 py-3 rounded-xl items-center justify-center"
                >
                  <Text
                    className={`font-semibold text-sm font-body ${
                      activeTab === "received" ? "text-primary dark:text-[#bcc2ff]" : "text-on-surface-variant dark:text-[#c5c5d4]"
                    }`}
                  >
                    Requests Received
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("sent")}
                  style={
                    activeTab === "sent"
                      ? {
                          backgroundColor: isDark ? "#191c1e" : "#ffffff",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 2,
                        }
                      : null
                  }
                  className="px-5 md:px-8 py-3 rounded-xl items-center justify-center"
                >
                  <Text
                    className={`font-semibold text-sm font-body ${
                      activeTab === "sent" ? "text-primary dark:text-[#bcc2ff]" : "text-on-surface-variant dark:text-[#c5c5d4]"
                    }`}
                  >
                    Requests Sent
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-col gap-6">
                {loading ? (
                  <View className="py-20 items-center justify-center">
                    <ActivityIndicator size="large" color="#2b3896" />
                  </View>
                ) : currentRequests.length === 0 ? (
                  <View className="py-20 items-center justify-center bg-surface-container-lowest dark:bg-[#191c1e] rounded-[24px] border border-transparent dark:border-[#3f4345] p-6 shadow-sm">
                    <MaterialIcons name="info-outline" size={48} color="#2b3896" className="mb-4 dark:text-[#bcc2ff]" />
                    <Text className="text-lg font-bold text-on-surface dark:text-[#f8f9fb] font-headline mb-1">
                      No requests {activeTab === "received" ? "received" : "sent"}
                    </Text>
                    <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] text-center font-body">
                      {activeTab === "received"
                        ? "When other users request your items, they will appear here."
                        : "When you request other users' items, they will appear here."}
                    </Text>
                  </View>
                ) : (
                  currentRequests.map((item) => {
                    const relativeTime = getRelativeTime(item.created_at);
                    const status = item.status;
                    const isPending = status === "pending";
                    const isApproved = status === "approved";
                    const isExchanged = status === "exchanged";
                    const isReturnPending = status === "return_pending";
                    const isReturned = status === "returned";
                    const isRejected = status === "rejected";
                    const isComplete = isReturned;

                    const myReview = item.reviews?.find((r: any) => r.reviewer_id === parseInt(currentUserId));
                    const theirReview = item.reviews?.find((r: any) => r.reviewer_id !== parseInt(currentUserId));

                    const badge = getStatusBadge(status);
                    const workflowStep = getWorkflowStep(status);

                    const imageUrl = item.image
                      ? (item.image.startsWith("http") ? item.image : BASE_URL + item.image)
                      : "https://via.placeholder.com/150";

                    return (
                      <View
                        key={item.request_id}
                        className="rounded-[24px] p-5 md:p-6"
                        style={[
                          isRejected
                            ? {
                                backgroundColor: isDark ? "rgba(45, 49, 51, 0.5)" : "rgba(242, 244, 246, 0.5)",
                                borderWidth: 1,
                                borderColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.1)",
                                opacity: 0.75,
                              }
                            : isComplete
                            ? {
                                backgroundColor: isDark ? "#191c1e" : "#ffffff",
                                borderWidth: 1,
                                borderColor: isDark ? "#3f4345" : "transparent",
                                opacity: 0.8,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                              }
                            : {
                                backgroundColor: isDark ? "#191c1e" : "#ffffff",
                                borderWidth: 1,
                                borderColor: isDark ? "#3f4345" : "transparent",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                              }
                        ]}
                      >
                        <View className="flex-col md:flex-row md:items-center justify-between gap-6">
                          {/* Left: image + info */}
                          <View className="flex-row items-start gap-4 md:gap-5 flex-1 pr-4">
                            <View className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                              <Image
                                source={{ uri: imageUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                              />
                            </View>
                            <View className="flex-col flex-1">
                              <View className="flex-row flex-wrap items-center gap-2 mb-1">
                                {/* Status badge */}
                                <View className={`${badge.bg} px-3 py-1 rounded-full`}>
                                  <Text className={`${badge.text} text-[10px] font-bold tracking-widest uppercase font-label`}>
                                    {badge.label}
                                  </Text>
                                </View>
                                <Text className="text-on-surface-variant dark:text-[#c5c5d4] text-xs font-medium font-body">
                                  {relativeTime}
                                </Text>
                              </View>
                              <Text className="text-lg md:text-xl font-bold text-on-surface dark:text-[#f8f9fb] mb-1 font-headline leading-tight">
                                {item.title}
                              </Text>
                              <View className="flex-row items-center gap-2 mt-1">
                                <View className="w-6 h-6 rounded-full bg-primary-container dark:bg-[#303c9a] flex items-center justify-center overflow-hidden">
                                  <Text className="text-[10px] font-bold text-white uppercase">
                                    {activeTab === "received"
                                      ? (item.requester_name ? item.requester_name.substring(0, 2) : "??")
                                      : (item.owner_name ? item.owner_name.substring(0, 2) : "??")}
                                  </Text>
                                </View>
                                <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] font-medium font-body">
                                  {activeTab === "received" ? (
                                    <>
                                      Request from <Text className="text-primary dark:text-[#bcc2ff] font-bold">{item.requester_name}</Text>
                                    </>
                                  ) : (
                                    <>
                                      Owner: <Text className="text-primary dark:text-[#bcc2ff] font-bold">{item.owner_name}</Text>
                                    </>
                                  )}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Right: action buttons */}
                          <View
                            className={
                              isPending
                                ? "flex-row md:flex-col gap-2 items-center md:items-end justify-center md:justify-start"
                                : "flex-row gap-2 items-center justify-center flex-wrap"
                            }
                          >
                            {/* Chat button — always visible */}
                            <TouchableOpacity
                              onPress={() => navigation.navigate("Inbox" as never)}
                              className="p-3 rounded-xl bg-surface-container-highest dark:bg-[#3f4345] active:scale-95 transition-transform items-center justify-center"
                            >
                              <MaterialIcons name="chat-bubble" size={20} color="#2b3896" className="dark:text-[#bcc2ff]" />
                            </TouchableOpacity>

                            {/* ── OWNER (received tab) actions ─────────────────────── */}

                            {/* Pending: Approve / Reject */}
                            {activeTab === "received" && isPending && (
                              <>
                                <TouchableOpacity
                                  onPress={() => handleApprove(item.request_id)}
                                  className="flex-1 md:flex-none px-5 md:px-6 py-3 rounded-xl bg-secondary-container dark:bg-[#005048] active:scale-95 transition-transform items-center justify-center"
                                >
                                  <Text className="text-on-secondary-container dark:text-[#8df5e4] font-bold text-sm font-label">Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => handleReject(item.request_id)}
                                  className="flex-1 md:flex-none px-5 md:px-6 py-3 rounded-xl bg-surface-container-low dark:bg-[#2d3133] active:scale-95 transition-transform items-center justify-center"
                                >
                                  <Text className="text-error dark:text-[#ffdad6] font-bold text-sm font-label">Reject</Text>
                                </TouchableOpacity>
                              </>
                            )}

                            {/* Approved: Generate Exchange QR */}
                            {activeTab === "received" && isApproved && (
                              <TouchableOpacity
                                onPress={() => handleGenerateExchangeQR(item.request_id, item.requester_name)}
                                className="flex-row flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-[#bcc2ff] active:scale-95 transition-transform shadow-sm"
                              >
                                <MaterialIcons name="qr-code-2" size={18} color="#ffffff" />
                                <Text className="text-white dark:text-[#000c62] font-bold text-sm font-label">Verify Exchange</Text>
                              </TouchableOpacity>
                            )}

                            {/* Exchanged: Scan client's return QR */}
                            {activeTab === "received" && isExchanged && (
                              <TouchableOpacity
                                onPress={() => handleOpenScanner("return")}
                                className="flex-row flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tertiary dark:bg-[#7a5900] active:scale-95 transition-transform shadow-sm"
                              >
                                <MaterialIcons name="qr-code-scanner" size={18} color="#ffffff" />
                                <Text className="text-white font-bold text-sm font-label">Scan Return QR</Text>
                              </TouchableOpacity>
                            )}

                            {/* Return Pending: Scan client's return QR (still waiting) */}
                            {activeTab === "received" && isReturnPending && (
                              <TouchableOpacity
                                onPress={() => handleOpenScanner("return")}
                                className="flex-row flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tertiary dark:bg-[#7a5900] active:scale-95 transition-transform shadow-sm"
                              >
                                <MaterialIcons name="qr-code-scanner" size={18} color="#ffffff" />
                                <Text className="text-white font-bold text-sm font-label">Scan Return QR</Text>
                              </TouchableOpacity>
                            )}

                            {/* Returned: Done badge + Give Rating */}
                            {activeTab === "received" && isReturned && (
                              <View className="flex-row items-center gap-2 flex-wrap">
                                <View className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-fixed dark:bg-[#005048]">
                                  <MaterialIcons name="check-circle" size={16} color="#8df5e4" />
                                  <Text className="text-on-secondary-fixed-variant dark:text-[#8df5e4] font-bold text-xs font-label">Exchange Complete</Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => handleOpenReviewModal(item)}
                                  className="px-4 py-2.5 rounded-xl bg-primary dark:bg-[#bcc2ff] active:scale-95 transition-transform flex-row items-center gap-1.5 shadow-sm"
                                >
                                  <MaterialIcons name="star" size={14} color="#ffffff" className="dark:text-[#000c62]" />
                                  <Text className="text-white dark:text-[#000c62] font-bold text-xs font-label">
                                    {myReview ? "Edit Review" : "Give Rating"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}

                            {/* ── CLIENT (sent tab) actions ────────────────────────── */}

                            {/* Pending: Cancel */}
                            {activeTab === "sent" && isPending && (
                              <TouchableOpacity
                                onPress={() => handleCancel(item.request_id)}
                                className="flex-1 md:flex-none px-5 md:px-6 py-3 rounded-xl bg-surface-container-low dark:bg-[#2d3133] active:scale-95 transition-transform items-center justify-center"
                              >
                                <Text className="text-error dark:text-[#ffdad6] font-bold text-sm font-label">Cancel Request</Text>
                              </TouchableOpacity>
                            )}

                            {/* Approved: Scan owner's exchange QR */}
                            {activeTab === "sent" && isApproved && (
                              <TouchableOpacity
                                onPress={() => handleOpenScanner("exchange")}
                                className="flex-row flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-[#bcc2ff] active:scale-95 transition-transform shadow-sm"
                              >
                                <MaterialIcons name="qr-code-scanner" size={18} color="#ffffff" />
                                <Text className="text-white dark:text-[#000c62] font-bold text-sm font-label">Scan Exchange QR</Text>
                              </TouchableOpacity>
                            )}

                            {/* Exchanged: Generate Return QR */}
                            {activeTab === "sent" && isExchanged && (
                              <TouchableOpacity
                                onPress={() => handleGenerateReturnQR(item.request_id, item.owner_name)}
                                className="flex-row flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tertiary dark:bg-[#7a5900] active:scale-95 transition-transform shadow-sm"
                              >
                                <MaterialIcons name="qr-code-2" size={18} color="#ffffff" />
                                <Text className="text-white font-bold text-sm font-label">Return Item</Text>
                              </TouchableOpacity>
                            )}

                            {/* Return Pending: Show return QR again */}
                            {activeTab === "sent" && isReturnPending && (
                              <TouchableOpacity
                                onPress={() => handleGenerateReturnQR(item.request_id, item.owner_name)}
                                className="flex-row flex-1 md:flex-none items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tertiary dark:bg-[#7a5900] active:scale-95 transition-transform shadow-sm"
                              >
                                <MaterialIcons name="qr-code-2" size={18} color="#ffffff" />
                                <Text className="text-white font-bold text-sm font-label">Show Return QR</Text>
                              </TouchableOpacity>
                            )}

                            {/* Returned: Done + Give Rating */}
                            {activeTab === "sent" && isReturned && (
                              <View className="flex-row items-center gap-2 flex-wrap">
                                <View className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-fixed dark:bg-[#005048]">
                                  <MaterialIcons name="check-circle" size={16} color="#8df5e4" />
                                  <Text className="text-on-secondary-fixed-variant dark:text-[#8df5e4] font-bold text-xs font-label">Return Confirmed</Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => handleOpenReviewModal(item)}
                                  className="px-4 py-2.5 rounded-xl bg-primary dark:bg-[#bcc2ff] active:scale-95 transition-transform flex-row items-center gap-1.5 shadow-sm"
                                >
                                  <MaterialIcons name="star" size={14} color="#ffffff" className="dark:text-[#000c62]" />
                                  <Text className="text-white dark:text-[#000c62] font-bold text-xs font-label">
                                    {myReview ? "Edit Review" : "Give Rating"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* ── 5-Step Workflow Indicator ──────────────────────────────── */}
                        {!isRejected && (
                          <View
                            className="mt-8 pt-6"
                            style={{
                              borderTopWidth: 1,
                              borderTopColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.2)",
                            }}
                          >
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              <View className="flex-row items-center justify-between relative min-w-[340px] w-full px-2 pt-[14px]">
                                {/* Background line */}
                                <View className="absolute top-[22px] left-8 right-8 h-[2px] bg-surface-container-high dark:bg-[#2d3133] z-0" />
                                {/* Progress line */}
                                <View
                                  className="absolute top-[22px] left-8 h-[2px] z-0 bg-primary dark:bg-[#bcc2ff]"
                                  style={{ width: `${(workflowStep / 4) * 82}%` }}
                                />

                                {/* Step nodes */}
                                {[
                                  { label: "Request", icon: "send" },
                                  { label: "Approved", icon: "check" },
                                  { label: "Exchanged", icon: "swap-horiz" },
                                  { label: "Returning", icon: "undo" },
                                  { label: "Done", icon: "verified" },
                                ].map((step, index) => {
                                  const isActive = workflowStep >= index;
                                  const isCurrent = workflowStep === index;
                                  return (
                                    <View key={index} className="z-10 flex-col items-center gap-2">
                                      {isCurrent ? (
                                        <View className="w-6 h-6 rounded-full bg-surface-container-lowest dark:bg-[#191c1e] border-2 border-primary dark:border-[#bcc2ff] flex items-center justify-center">
                                          <View className="w-2 h-2 rounded-full bg-primary dark:bg-[#bcc2ff]" />
                                        </View>
                                      ) : (
                                        <View
                                          className={`w-4 h-4 rounded-full border-[4px] border-surface-container-lowest dark:border-[#191c1e] ${
                                            isActive ? "bg-primary dark:bg-[#bcc2ff]" : "bg-surface-container-high dark:bg-[#3f4345]"
                                          }`}
                                        />
                                      )}
                                      <Text
                                        className={`text-[10px] font-bold uppercase tracking-tight font-label ${
                                          isActive ? "text-primary dark:text-[#bcc2ff]" : "text-on-surface-variant dark:text-[#c5c5d4]"
                                        }`}
                                      >
                                        {step.label}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>
                            </ScrollView>
                          </View>
                        )}

                        {isReturned && (
                          <View
                            className="mt-6 pt-6 flex-col gap-4"
                            style={{
                              borderTopWidth: 1,
                              borderTopColor: isDark ? "#3f4345" : "rgba(197, 197, 212, 0.2)",
                            }}
                          >
                            <Text className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-[#c5c5d4] font-label">
                              Peer Reviews
                            </Text>
                            
                            <View className="flex-col md:flex-row gap-4">
                              {/* My review */}
                              <View className="flex-1 p-4 rounded-2xl bg-surface-container-low dark:bg-[#2d3133]">
                                <Text className="text-xs font-bold text-primary dark:text-[#bcc2ff] mb-2 font-label">Your Feedback</Text>
                                {myReview ? (
                                  <View>
                                    <View className="flex-row items-center gap-1 mb-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <MaterialIcons
                                          key={star}
                                          name="star"
                                          size={16}
                                          color={star <= myReview.rating ? "#e0a900" : (isDark ? "#555" : "#ccc")}
                                        />
                                      ))}
                                    </View>
                                    <Text className="text-sm text-on-surface dark:text-[#f8f9fb] italic font-body">
                                      "{myReview.message || "No comment left."}"
                                    </Text>
                                  </View>
                                ) : (
                                  <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] italic font-body">
                                    You haven't left a review yet.
                                  </Text>
                                )}
                              </View>

                              {/* Their review */}
                              <View className="flex-1 p-4 rounded-2xl bg-surface-container-low dark:bg-[#2d3133]">
                                <Text className="text-xs font-bold text-primary dark:text-[#bcc2ff] mb-2 font-label">
                                  {activeTab === "received" ? "Client's Feedback" : "Owner's Feedback"}
                                </Text>
                                {theirReview ? (
                                  <View>
                                    <View className="flex-row items-center gap-1 mb-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <MaterialIcons
                                          key={star}
                                          name="star"
                                          size={16}
                                          color={star <= theirReview.rating ? "#e0a900" : (isDark ? "#555" : "#ccc")}
                                        />
                                      ))}
                                    </View>
                                    <Text className="text-sm text-on-surface dark:text-[#f8f9fb] italic font-body">
                                      "{theirReview.message || "No comment left."}"
                                    </Text>
                                  </View>
                                ) : (
                                  <Text className="text-sm text-on-surface-variant dark:text-[#c5c5d4] italic font-body">
                                    No feedback received yet.
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>

          <BottomNav
            activeRoute="Activity"
            onNavigate={(route) => (navigation.navigate as any)(route)}
          />
        </View>
      </View>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <QRModal
        visible={qrModalVisible}
        qrPayload={qrPayload}
        title={qrTitle}
        subtitle={qrSubtitle}
        onClose={handleQRModalClose}
      />

      {scannerVisible && (
        <ScannerModal
          visible={scannerVisible}
          scanType={scanType}
          currentUserId={currentUserId}
          onClose={() => setScannerVisible(false)}
          onSuccess={handleScanSuccess}
        />
      )}

      {reviewModalVisible && (
        <ReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          onSubmit={handleSubmitReview}
          initialRating={
            selectedRequest?.reviews?.find((r: any) => r.reviewer_id === parseInt(currentUserId))?.rating || 5
          }
          initialMessage={
            selectedRequest?.reviews?.find((r: any) => r.reviewer_id === parseInt(currentUserId))?.message || ""
          }
          isSubmitting={isSubmittingReview}
          targetName={
            activeTab === "received" ? selectedRequest?.requester_name : selectedRequest?.owner_name
          }
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (for native-style components that can't use NativeWind classnames)
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Shared backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // QR display modal card
  qrModalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  qrModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  qrIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2b3896",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 6,
    textAlign: "center",
  },
  qrModalSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 19,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  qrInstructionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eef0ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrInstruction: {
    fontSize: 12,
    color: "#4b4fb5",
    flex: 1,
    fontWeight: "600",
  },
  closeFullBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2b3896",
    alignItems: "center",
  },
  closeFullBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Scanner error fallback
  scannerErrorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 32,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 12,
  },
  scannerErrorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  scannerErrorBody: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },

  // Scanner modal
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  scannerTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scannerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 32,
  },
  permissionText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  permissionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2b3896",
  },
  permissionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Scanner overlay / frame
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 240,
    height: 240,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#ffffff",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scannerHint: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
    paddingHorizontal: 32,
    opacity: 0.9,
  },
  scanningIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  scanningText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  scanErrorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: "rgba(180,0,0,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    maxWidth: 300,
  },
  scanErrorText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  scanRetryText: {
    color: "#ffcc00",
    fontSize: 13,
    fontWeight: "700",
  },
});
