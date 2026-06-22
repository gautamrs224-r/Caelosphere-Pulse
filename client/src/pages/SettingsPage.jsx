import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Camera,
  User,
  Palette,
  Check,
  FileText,
  LogOut,
} from "lucide-react";
import Avatar from "../components/ui/Avatar.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import SettingsSection from "../components/settings/SettingsSection.jsx";
import SettingsRow from "../components/settings/SettingsRow.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

const THEMES = [
  { id: "dark-purple", label: "Dark Purple", color: "#7C3AED" },
  { id: "dark-blue", label: "Dark Blue", color: "#3B82F6" },
  { id: "dark-gray", label: "Dark Gray", color: "#6B7280" },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null); // "password" | "name" | "bio" | null
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  // Edit name state
  const [name, setName] = useState(user?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);

  // Edit bio state
  const [bio, setBio] = useState(user?.bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleThemeSelect = async (themeId) => {
    setTheme(themeId);
    try {
      const { data } = await axiosInstance.put("/users/profile", { theme: themeId });
      updateUser(data.user);
    } catch (err) {
      // Theme still applies locally even if persistence fails
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploadingPic(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await axiosInstance.post("/users/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ profilePic: data.profilePic });
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveName = async () => {
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setIsSavingName(true);
    try {
      const { data } = await axiosInstance.put("/users/profile", { name: name.trim() });
      updateUser(data.user);
      toast.success("Name updated");
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      const { data } = await axiosInstance.put("/users/profile", { bio });
      updateUser(data.user);
      toast.success("Bio updated");
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bio");
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Required";
    if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Must be at least 8 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsChangingPassword(true);
    try {
      await axiosInstance.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setActiveModal(null);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 sm:px-8 py-6 border-b border-border">
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="max-w-2xl w-full mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* Profile header */}
        <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5">
          <div className="relative">
            <Avatar src={user?.profilePic} name={user?.name} size="xl" showStatus isOnline />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPic}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center border-2 border-card transition-colors"
              aria-label="Change profile picture"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePictureChange}
            />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-white truncate">{user?.name}</p>
            <p className="text-sm text-textSecondary truncate">{user?.email}</p>
            {user?.bio && (
              <p className="text-sm text-textSecondary truncate mt-0.5 italic">
                "{user.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Account */}
        <SettingsSection title="Account">
          {user?.authProvider !== "google" && (
            <SettingsRow
              icon={Lock}
              label="Change Password"
              onClick={() => setActiveModal("password")}
            />
          )}
          <SettingsRow
            icon={Camera}
            label="Update Profile Picture"
            onClick={() => fileInputRef.current?.click()}
          />
          <SettingsRow
            icon={User}
            label="Edit Name"
            onClick={() => {
              setName(user?.name || "");
              setActiveModal("name");
            }}
          />
          <SettingsRow
            icon={FileText}
            label="Edit Bio"
            onClick={() => {
              setBio(user?.bio || "");
              setActiveModal("bio");
            }}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 mb-4 text-textSecondary">
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Theme</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeSelect(t.id)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                    theme === t.id ? "border-primary" : "border-border"
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: t.color }}
                  >
                    {theme === t.id && <Check className="w-4 h-4 text-white" />}
                  </span>
                  <span className="text-xs text-textSecondary">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* Logout — only way to log out on mobile, where the sidebar is hidden */}
        <SettingsSection>
          <SettingsRow
            icon={LogOut}
            label="Logout"
            danger
            onClick={handleLogout}
            rightElement={<span />}
          />
        </SettingsSection>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={activeModal === "password"}
        onClose={() => setActiveModal(null)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            placeholder="Enter current password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
            }
            error={passwordErrors.currentPassword}
          />
          <Input
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="Enter new password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            error={passwordErrors.newPassword}
          />
          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="Confirm new password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
            }
            error={passwordErrors.confirmPassword}
          />
          <Button
            className="w-full"
            size="lg"
            onClick={handleChangePassword}
            isLoading={isChangingPassword}
          >
            Update Password
          </Button>
        </div>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        isOpen={activeModal === "name"}
        onClose={() => setActiveModal(null)}
        title="Edit Name"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <Button className="w-full" size="lg" onClick={handleSaveName} isLoading={isSavingName}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Edit Bio Modal */}
      <Modal
        isOpen={activeModal === "bio"}
        onClose={() => setActiveModal(null)}
        title="Edit Bio"
      >
        <div className="space-y-4">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            placeholder="Tell people a little about yourself..."
            rows={3}
            className="w-full bg-elevated border border-border rounded-xl text-textPrimary placeholder:text-muted p-4 text-sm focus:border-primary focus:outline-none resize-none"
          />
          <p className="text-xs text-muted text-right">{bio.length}/160</p>
          <Button className="w-full" size="lg" onClick={handleSaveBio} isLoading={isSavingBio}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}