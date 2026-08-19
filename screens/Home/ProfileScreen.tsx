import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../components/api";
import { useTheme } from "../../components/ThemeContext";
import { useUser } from "../../components/UserContext";
import { useResponsive } from "../../components/useResponsive";
import WithDrawer from "../../components/withDrawer";

const AVATAR_COLORS = [
  "#00467F",
  "#4C9BE8",
  "#51CF66",
  "#845EF7",
  "#FF6B9D",
  "#FFB347",
  "#FF6B6B",
  "#20C997",
];

export default function ProfileScreen({ navigation }: any) {
  const { theme, fontSizes } = useTheme();
  const { user, setUser } = useUser();
  const { padding } = useResponsive();

  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [bio, setBio] = useState("");
  const [profileColor, setProfileColor] = useState("#00467F");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const [notifJoin, setNotifJoin] = useState(true);
  const [notifAnnounce, setNotifAnnounce] = useState(true);
  const [notifInvite, setNotifInvite] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
  const [allowInvites, setAllowInvites] = useState(true);

  const initials = (n: string) =>
    (n || "U")
      .split(" ")
      .map((x: string) => x[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const pwStrength = () => {
    if (!newPw) return null;
    if (newPw.length < 6)
      return { label: "Too short", color: "#FF6B6B", pct: 20 };
    if (newPw.length < 8) return { label: "Weak", color: "#FF6B6B", pct: 40 };
    if (newPw.length < 10)
      return { label: "Medium", color: "#FFB347", pct: 65 };
    return { label: "Strong", color: "#51CF66", pct: 100 };
  };
  const strength = pwStrength();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setStudentId(user.student_id || "");
        setDepartment(user.department || "");
        setLevel(user.level || "");
        setBio(user.bio || "");
        setProfileColor(user.profile_color || "#00467F");
        setProfilePic(user.profile_picture || null);
        setCoverPhoto(user.cover_photo || null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await api.get("/users/profile");
      if (res.data.success) {
        const u = res.data.user;
        setName(u.name || "");
        setEmail(u.email || "");
        setStudentId(u.student_id || "");
        setDepartment(u.department || "");
        setLevel(u.level || "");
        setBio(u.bio || "");
        setProfileColor(u.profile_color || "#00467F");
        setProfilePic(u.profile_picture || null);
        setCoverPhoto(u.cover_photo || null);
        setUser(u);
      }
    } catch (err) {
      console.log("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveToDb = async (updates: any) => {
    const payload = {
      name,
      email,
      department,
      level,
      bio,
      profile_color: profileColor,
      profile_picture: profilePic,
      cover_photo: coverPhoto,
      ...updates,
    };
    await api.put("/users/profile", payload);
    setUser({ ...user!, ...payload });
  };

  const pickProfilePic = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!res.canceled && res.assets[0].base64) {
      setUploadingPic(true);
      const img = `data:image/jpeg;base64,${res.assets[0].base64}`;
      setProfilePic(img);
      setUser({ ...user!, profile_picture: img });
      try {
        await saveToDb({ profile_picture: img });
      } catch {}
      setUploadingPic(false);
    }
  };

  const pickCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.2,
      base64: true,
    });
    if (!res.canceled && res.assets[0].base64) {
      setUploadingCover(true);
      const img = `data:image/jpeg;base64,${res.assets[0].base64}`;
      setCoverPhoto(img);
      setUser({ ...user!, cover_photo: img });
      try {
        await saveToDb({ cover_photo: img });
      } catch {}
      setUploadingCover(false);
    }
  };

  const changeColor = async (color: string) => {
    setProfileColor(color);
    try {
      await saveToDb({ profile_color: color });
    } catch {}
  };

  const handleSaveInfo = async () => {
    setSaving(true);
    setSaveSuccess("");
    setSaveError("");
    try {
      await saveToDb({
        name,
        email,
        department,
        level,
        bio,
        profile_color: profileColor,
      });
      setIsEditing(false);
      setSaveSuccess("Profile updated!");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePw = async () => {
    setPwError("");
    setPwSuccess("");
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPw.length < 6) {
      setPwError("At least 6 characters required");
      return;
    }
    setSavingPw(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwSuccess("Password changed!");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSuccess(""), 3000);
    } catch (err: any) {
      setPwError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <WithDrawer
        navigation={navigation}
        activeScreen="Profile"
        title="Profile"
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00467F" />
          <Text style={[styles.centerText, { color: theme.subText }]}>
            Loading...
          </Text>
        </View>
      </WithDrawer>
    );
  }

  return (
    <WithDrawer navigation={navigation} activeScreen="Profile" title="Profile">
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo */}
        <View style={styles.coverBox}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.coverImg} />
          ) : (
            <View
              style={[styles.coverDefault, { backgroundColor: "#00467F" }]}
            />
          )}
          <View style={styles.coverOverlay} />

          <TouchableOpacity style={styles.changeCoverBtn} onPress={pickCover}>
            {uploadingCover ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="image-outline" size={13} color="#fff" />
                <Text style={styles.changeCoverText}>
                  {coverPhoto ? "Change Cover" : "Add Cover"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarBox}>
            <TouchableOpacity onPress={pickProfilePic}>
              {uploadingPic ? (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: profileColor,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <ActivityIndicator color="#fff" />
                </View>
              ) : profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImg} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: profileColor,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={styles.avatarInitials}>{initials(name)}</Text>
                </View>
              )}
              <View style={styles.avatarCamBtn}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name Section */}
        <View
          style={[
            styles.nameBox,
            { paddingHorizontal: padding, borderBottomColor: theme.border },
          ]}
        >
          <Text
            style={[
              styles.userName,
              { color: theme.text, fontSize: fontSizes.xl },
            ]}
          >
            {name}
          </Text>
          <Text
            style={[
              styles.userEmail,
              { color: theme.subText, fontSize: fontSizes.sm },
            ]}
          >
            {email}
          </Text>
          <View style={styles.badgeRow}>
            {!!department && (
              <View style={[styles.badge, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="school-outline" size={11} color="#00467F" />
                <Text style={[styles.badgeText, { fontSize: fontSizes.xs }]}>
                  {department}
                </Text>
              </View>
            )}
            {!!level && (
              <View style={[styles.badge, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="layers-outline" size={11} color="#00467F" />
                <Text style={[styles.badgeText, { fontSize: fontSizes.xs }]}>
                  {level}
                </Text>
              </View>
            )}
          </View>
          {!!saveSuccess && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
              <Text style={styles.successBannerText}>{saveSuccess}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.tabsRow,
            { paddingHorizontal: padding },
          ]}
          style={styles.tabsScroll}
        >
          {[
            { id: "info", label: "My Info", icon: "person-outline" },
            { id: "password", label: "Password", icon: "lock-closed-outline" },
            {
              id: "notifications",
              label: "Alerts",
              icon: "notifications-outline",
            },
            { id: "privacy", label: "Privacy", icon: "shield-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabChip,
                activeTab === tab.id && styles.tabChipActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={13}
                color={activeTab === tab.id ? "#fff" : theme.subText}
              />
              <Text
                style={[
                  styles.tabChipText,
                  {
                    color: activeTab === tab.id ? "#fff" : theme.subText,
                    fontSize: fontSizes.xs,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.tabContent, { paddingHorizontal: padding }]}>
          {/* ── MY INFO TAB ── */}
          {activeTab === "info" && (
            <View style={styles.section}>
              {/* Colors Card */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Avatar Color
                </Text>
                <Text
                  style={[
                    styles.cardSub,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  Used when no profile picture is set
                </Text>
                <View style={styles.colorGrid}>
                  {AVATAR_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorDot,
                        { backgroundColor: color },
                        profileColor === color && styles.colorDotSelected,
                      ]}
                      onPress={() => changeColor(color)}
                    >
                      {profileColor === color && (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Info Card */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.cardTitleRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: theme.text, fontSize: fontSizes.lg },
                      ]}
                    >
                      Student Information
                    </Text>
                    <Text
                      style={[
                        styles.cardSub,
                        { color: theme.subText, fontSize: fontSizes.xs },
                      ]}
                    >
                      Update your personal details
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.editBtn,
                      isEditing && { borderColor: "#FF6B6B" },
                    ]}
                    onPress={() => {
                      setIsEditing(!isEditing);
                      setSaveError("");
                    }}
                  >
                    <Ionicons
                      name={isEditing ? "close-outline" : "create-outline"}
                      size={14}
                      color={isEditing ? "#FF6B6B" : "#00467F"}
                    />
                    <Text
                      style={[
                        styles.editBtnText,
                        isEditing && { color: "#FF6B6B" },
                      ]}
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!!saveError && (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#FF6B6B"
                    />
                    <Text style={styles.errorText}>{saveError}</Text>
                  </View>
                )}

                {isEditing ? (
                  <View style={styles.formFields}>
                    {[
                      {
                        label: "Full Name",
                        value: name,
                        setter: setName,
                        icon: "person-outline",
                        placeholder: "Your full name",
                      },
                      {
                        label: "Email",
                        value: email,
                        setter: setEmail,
                        icon: "mail-outline",
                        placeholder: "your@email.com",
                      },
                      {
                        label: "Student ID",
                        value: studentId,
                        setter: setStudentId,
                        icon: "card-outline",
                        placeholder: "10XXXXXXX",
                      },
                      {
                        label: "Department",
                        value: department,
                        setter: setDepartment,
                        icon: "school-outline",
                        placeholder: "Your department",
                      },
                      {
                        label: "Level",
                        value: level,
                        setter: setLevel,
                        icon: "layers-outline",
                        placeholder: "e.g. Level 300",
                      },
                    ].map((f, i) => (
                      <View key={i} style={styles.fieldGroup}>
                        <Text
                          style={[
                            styles.fieldLabel,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {f.label}
                        </Text>
                        <View
                          style={[
                            styles.inputRow,
                            {
                              backgroundColor: theme.inputBg,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name={f.icon as any}
                            size={16}
                            color={theme.subText}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={[
                              styles.input,
                              { color: theme.text, fontSize: fontSizes.sm },
                            ]}
                            value={f.value}
                            onChangeText={f.setter}
                            placeholder={f.placeholder}
                            placeholderTextColor={theme.subText}
                            autoCapitalize="none"
                          />
                        </View>
                      </View>
                    ))}

                    <View style={styles.fieldGroup}>
                      <Text
                        style={[
                          styles.fieldLabel,
                          { color: theme.subText, fontSize: fontSizes.xs },
                        ]}
                      >
                        Bio
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.border,
                            height: 90,
                            alignItems: "flex-start",
                            paddingVertical: 10,
                          },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            {
                              color: theme.text,
                              fontSize: fontSizes.sm,
                              height: 70,
                              textAlignVertical: "top",
                            },
                          ]}
                          value={bio}
                          onChangeText={setBio}
                          placeholder="Tell others about yourself..."
                          placeholderTextColor={theme.subText}
                          multiline
                          maxLength={200}
                        />
                      </View>
                      <Text
                        style={[
                          styles.charCount,
                          { color: theme.subText, fontSize: fontSizes.xs },
                        ]}
                      >
                        {bio.length}/200
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                      onPress={handleSaveInfo}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.saveBtnText}>Save Changes</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.infoList}>
                    {[
                      {
                        icon: "person-outline",
                        label: "Full Name",
                        value: name,
                      },
                      { icon: "mail-outline", label: "Email", value: email },
                      {
                        icon: "card-outline",
                        label: "Student ID",
                        value: studentId,
                      },
                      {
                        icon: "school-outline",
                        label: "Department",
                        value: department,
                      },
                      { icon: "layers-outline", label: "Level", value: level },
                      {
                        icon: "chatbubble-outline",
                        label: "Bio",
                        value: bio || "No bio added yet",
                      },
                    ].map((item, i, arr) => (
                      <View
                        key={i}
                        style={[
                          styles.infoRow,
                          { borderBottomColor: theme.border },
                          i < arr.length - 1 && { borderBottomWidth: 1 },
                        ]}
                      >
                        <View
                          style={[
                            styles.infoIconBox,
                            { backgroundColor: theme.inputBg },
                          ]}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={14}
                            color="#00467F"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.infoLabel,
                              { color: theme.subText, fontSize: fontSizes.xs },
                            ]}
                          >
                            {item.label}
                          </Text>
                          <Text
                            style={[
                              styles.infoValue,
                              { color: theme.text, fontSize: fontSizes.sm },
                            ]}
                          >
                            {item.value}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Danger */}
              <View style={styles.dangerCard}>
                <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
                <Text style={styles.dangerDesc}>
                  Deleting your account is permanent and cannot be undone.
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setShowDeleteModal(true)}
                >
                  <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                  <Text style={styles.deleteBtnText}>Delete My Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── PASSWORD TAB ── */}
          {activeTab === "password" && (
            <View style={styles.section}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Change Password
                </Text>
                <Text
                  style={[
                    styles.cardSub,
                    { color: theme.subText, fontSize: fontSizes.xs },
                  ]}
                >
                  Keep your account secure with a strong password
                </Text>

                {!!pwError && (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#FF6B6B"
                    />
                    <Text style={styles.errorText}>{pwError}</Text>
                  </View>
                )}
                {!!pwSuccess && (
                  <View style={styles.successBox}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color="#51CF66"
                    />
                    <Text style={styles.successText}>{pwSuccess}</Text>
                  </View>
                )}

                <View style={styles.formFields}>
                  {[
                    {
                      label: "Current Password",
                      value: currentPw,
                      setter: setCurrentPw,
                      show: showCurrent,
                      toggle: () => setShowCurrent(!showCurrent),
                      icon: "lock-closed-outline",
                    },
                    {
                      label: "New Password",
                      value: newPw,
                      setter: setNewPw,
                      show: showNew,
                      toggle: () => setShowNew(!showNew),
                      icon: "lock-open-outline",
                    },
                    {
                      label: "Confirm Password",
                      value: confirmPw,
                      setter: setConfirmPw,
                      show: showConfirm,
                      toggle: () => setShowConfirm(!showConfirm),
                      icon: "shield-checkmark-outline",
                    },
                  ].map((f, i) => (
                    <View key={i} style={styles.fieldGroup}>
                      <Text
                        style={[
                          styles.fieldLabel,
                          { color: theme.subText, fontSize: fontSizes.xs },
                        ]}
                      >
                        {f.label}
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.border,
                          },
                          i === 2 &&
                            confirmPw.length > 0 && {
                              borderColor:
                                confirmPw === newPw ? "#51CF66" : "#FF6B6B",
                            },
                        ]}
                      >
                        <Ionicons
                          name={f.icon as any}
                          size={16}
                          color={theme.subText}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[
                            styles.input,
                            { color: theme.text, fontSize: fontSizes.sm },
                          ]}
                          value={f.value}
                          onChangeText={f.setter}
                          placeholder={`Enter ${f.label.toLowerCase()}`}
                          placeholderTextColor={theme.subText}
                          secureTextEntry={!f.show}
                        />
                        <TouchableOpacity onPress={f.toggle}>
                          <Ionicons
                            name={f.show ? "eye-outline" : "eye-off-outline"}
                            size={16}
                            color={theme.subText}
                          />
                        </TouchableOpacity>
                      </View>
                      {i === 1 && !!strength && (
                        <View style={styles.strengthRow}>
                          <View
                            style={[
                              styles.strengthTrack,
                              { backgroundColor: theme.border },
                            ]}
                          >
                            <View
                              style={[
                                styles.strengthFill,
                                {
                                  width: `${strength.pct}%`,
                                  backgroundColor: strength.color,
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.strengthLabel,
                              { color: strength.color, fontSize: fontSizes.xs },
                            ]}
                          >
                            {strength.label}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}

                  <View
                    style={[
                      styles.rulesBox,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rulesTitle,
                        { color: theme.subText, fontSize: fontSizes.xs },
                      ]}
                    >
                      Requirements
                    </Text>
                    {[
                      { rule: "At least 8 characters", met: newPw.length >= 8 },
                      { rule: "Contains a number", met: /\d/.test(newPw) },
                      {
                        rule: "Contains uppercase letter",
                        met: /[A-Z]/.test(newPw),
                      },
                      {
                        rule: "Passwords match",
                        met: newPw === confirmPw && confirmPw.length > 0,
                      },
                    ].map((r, i) => (
                      <View key={i} style={styles.ruleItem}>
                        <Ionicons
                          name={r.met ? "checkmark-circle" : "ellipse-outline"}
                          size={14}
                          color={r.met ? "#51CF66" : theme.subText}
                        />
                        <Text
                          style={[
                            styles.ruleText,
                            {
                              color: r.met ? "#51CF66" : theme.subText,
                              fontSize: fontSizes.xs,
                            },
                          ]}
                        >
                          {r.rule}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      (savingPw ||
                        !currentPw ||
                        !newPw ||
                        newPw !== confirmPw) && { opacity: 0.6 },
                    ]}
                    onPress={handleSavePw}
                    disabled={
                      savingPw || !currentPw || !newPw || newPw !== confirmPw
                    }
                  >
                    {savingPw ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.saveBtnText}>Update Password</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "notifications" && (
            <View style={styles.section}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Notification Preferences
                </Text>
                <View style={styles.toggleList}>
                  {[
                    {
                      icon: "checkmark-circle-outline",
                      color: "#51CF66",
                      title: "Join Approvals",
                      desc: "When your join request is approved",
                      value: notifJoin,
                      setter: setNotifJoin,
                    },
                    {
                      icon: "megaphone-outline",
                      color: "#4C9BE8",
                      title: "Announcements",
                      desc: "When a group posts an announcement",
                      value: notifAnnounce,
                      setter: setNotifAnnounce,
                    },
                    {
                      icon: "mail-outline",
                      color: "#845EF7",
                      title: "Invitations",
                      desc: "When someone invites you to a group",
                      value: notifInvite,
                      setter: setNotifInvite,
                    },
                  ].map((item, i, arr) => (
                    <View
                      key={i}
                      style={[
                        styles.toggleRow,
                        { borderBottomColor: theme.border },
                        i < arr.length - 1 && { borderBottomWidth: 1 },
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleIcon,
                          { backgroundColor: item.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={item.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.toggleTitle,
                            { color: theme.text, fontSize: fontSizes.sm },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.toggleDesc,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {item.desc}
                        </Text>
                      </View>
                      <Switch
                        value={item.value}
                        onValueChange={item.setter}
                        trackColor={{ false: theme.border, true: "#00467F" }}
                        thumbColor="#fff"
                      />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ── PRIVACY TAB ── */}
          {activeTab === "privacy" && (
            <View style={styles.section}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: fontSizes.lg },
                  ]}
                >
                  Privacy Settings
                </Text>
                <View style={styles.toggleList}>
                  {[
                    {
                      icon: "globe-outline",
                      color: "#4C9BE8",
                      title: "Public Profile",
                      desc: "Allow others to view your profile",
                      value: profilePublic,
                      setter: setProfilePublic,
                    },
                    {
                      icon: "people-outline",
                      color: "#51CF66",
                      title: "Show My Groups",
                      desc: "Display your groups on your profile",
                      value: showGroups,
                      setter: setShowGroups,
                    },
                    {
                      icon: "person-add-outline",
                      color: "#845EF7",
                      title: "Allow Invitations",
                      desc: "Let others invite you to groups",
                      value: allowInvites,
                      setter: setAllowInvites,
                    },
                  ].map((item, i, arr) => (
                    <View
                      key={i}
                      style={[
                        styles.toggleRow,
                        { borderBottomColor: theme.border },
                        i < arr.length - 1 && { borderBottomWidth: 1 },
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleIcon,
                          { backgroundColor: item.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={item.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.toggleTitle,
                            { color: theme.text, fontSize: fontSizes.sm },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.toggleDesc,
                            { color: theme.subText, fontSize: fontSizes.xs },
                          ]}
                        >
                          {item.desc}
                        </Text>
                      </View>
                      <Switch
                        value={item.value}
                        onValueChange={item.setter}
                        trackColor={{ false: theme.border, true: "#00467F" }}
                        thumbColor="#fff"
                      />
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  setUser(null);
                  navigation.navigate("Welcome");
                }}
              >
                <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setDeletePassword("");
          setDeleteError("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={styles.modalIconBox}>
              <Ionicons name="warning-outline" size={36} color="#FF6B6B" />
            </View>

            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Delete Account?
            </Text>
            <Text style={[styles.modalMsg, { color: theme.subText }]}>
              This will permanently delete your account, all your groups,
              messages and data.{"\n\n"}
              <Text style={{ fontWeight: "bold", color: "#FF6B6B" }}>
                This action cannot be undone.
              </Text>
            </Text>

            {/* Password confirmation */}
            <Text
              style={[
                styles.fieldLabel,
                {
                  color: theme.subText,
                  fontSize: fontSizes.xs,
                  alignSelf: "flex-start",
                  width: "100%",
                },
              ]}
            >
              Enter your password to confirm
            </Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: deleteError ? "#FF6B6B" : theme.border,
                  width: "100%",
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={theme.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, fontSize: fontSizes.sm },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={theme.subText}
                secureTextEntry
                value={deletePassword}
                onChangeText={(t) => {
                  setDeletePassword(t);
                  setDeleteError("");
                }}
              />
            </View>

            {!!deleteError && (
              <View style={[styles.errorBox, { width: "100%", marginTop: 8 }]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color="#FF6B6B"
                />
                <Text style={styles.errorText}>{deleteError}</Text>
              </View>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                  },
                ]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
              >
                <Text
                  style={[styles.modalCancelText, { color: theme.subText }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalDeleteBtn,
                  (!deletePassword || deletingAccount) && { opacity: 0.6 },
                ]}
                onPress={async () => {
                  if (!deletePassword) {
                    setDeleteError("Please enter your password");
                    return;
                  }
                  setDeletingAccount(true);
                  setDeleteError("");
                  try {
                    await api.delete("/users/delete-account", {
                      data: { password: deletePassword },
                    });
                    setShowDeleteModal(false);
                    setUser(null);
                    navigation.navigate("Welcome");
                  } catch (err: any) {
                    setDeleteError(
                      err.response?.data?.message || "Failed to delete account",
                    );
                  } finally {
                    setDeletingAccount(false);
                  }
                }}
                disabled={!deletePassword || deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.modalDeleteText}>Yes, Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </WithDrawer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  centerText: { fontSize: 14 },
  scroll: { flex: 1 },

  coverBox: { height: 180, position: "relative" },
  coverImg: { width: "100%", height: "100%", resizeMode: "cover" },
  coverDefault: { width: "100%", height: "100%" },
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  changeCoverBtn: {
    position: "absolute",
    bottom: 52,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeCoverText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  avatarBox: { position: "absolute", bottom: -44, left: 20 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarInitials: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  avatarCamBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#00467F",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  nameBox: { paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1 },
  userName: { fontWeight: "bold", marginBottom: 2 },
  userEmail: { marginBottom: 8 },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: "#00467F", fontWeight: "500" },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FFF4",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#C3F0CA",
  },
  successBannerText: { color: "#2E7D32", fontSize: 12, fontWeight: "500" },

  tabsScroll: { marginVertical: 14 },
  tabsRow: { gap: 8 },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8ECF4",
  },
  tabChipActive: { backgroundColor: "#00467F", borderColor: "#00467F" },
  tabChipText: { fontWeight: "500" },

  tabContent: { paddingBottom: 16 },
  section: { gap: 16 },

  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 12,
    elevation: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitle: { fontWeight: "bold" },
  cardSub: { marginTop: 2 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderColor: "#00467F",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: { color: "#00467F", fontSize: 12, fontWeight: "600" },

  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotSelected: { borderWidth: 3, borderColor: "#fff", elevation: 4 },

  formFields: { gap: 12 },
  fieldGroup: { gap: 5 },
  fieldLabel: { fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1 },
  charCount: { textAlign: "right" },

  infoList: { gap: 0 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { marginBottom: 1 },
  infoValue: { fontWeight: "500" },

  saveBtn: {
    backgroundColor: "#00467F",
    borderRadius: 10,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  errorText: { color: "#FF6B6B", fontSize: 12, flex: 1 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F0FFF4",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#C3F0CA",
  },
  successText: { color: "#2E7D32", fontSize: 12, flex: 1 },

  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  strengthTrack: { flex: 1, height: 4, borderRadius: 2 },
  strengthFill: { height: 4, borderRadius: 2 },
  strengthLabel: { fontWeight: "600", width: 55 },

  rulesBox: { borderRadius: 10, padding: 12, gap: 8, borderWidth: 1 },
  rulesTitle: { fontWeight: "600", marginBottom: 2 },
  ruleItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: {},

  toggleList: { gap: 0 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTitle: { fontWeight: "600", marginBottom: 1 },
  toggleDesc: { lineHeight: 16 },

  dangerCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFD0D0",
    gap: 8,
  },
  dangerTitle: { fontSize: 14, fontWeight: "bold", color: "#FF6B6B" },
  dangerDesc: { fontSize: 12, color: "#888", lineHeight: 18 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: { color: "#FF6B6B", fontSize: 12, fontWeight: "600" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  logoutBtnText: { color: "#FF6B6B", fontSize: 14, fontWeight: "bold" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    borderRadius: 20,
    padding: 28,
    width: 320,
    alignItems: "center",
    gap: 12,
    elevation: 20,
  },
  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalMsg: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalDeleteBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#FF6B6B",
  },
  modalDeleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
