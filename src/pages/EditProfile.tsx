import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, User, Loader2, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);

        // Fetch user profile
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url, bio")
          .eq("user_id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found" - that's okay, we'll create it
          throw error;
        }

        if (data) {
          setUsername(data.username || "");
          setAvatarUrl(data.avatar_url || "");
          setBio(data.bio || "");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      toast({
        title: "Image uploaded!",
        description: "Your avatar has been updated. Don't forget to save your changes.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            username: username.trim() || null,
            avatar_url: avatarUrl.trim() || null,
            bio: bio.trim() || null,
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            username: username.trim() || null,
            avatar_url: avatarUrl.trim() || null,
            bio: bio.trim() || null,
          });

        if (error) throw error;
      }

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      // Delete user data from all tables
      await supabase.from("reviews").delete().eq("user_id", userId);
      await supabase.from("purgatory_votes").delete().eq("user_id", userId);
      await supabase.from("user_subscriptions").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("user_id", userId);

      // Sign out and redirect
      await supabase.auth.signOut();

      toast({
        title: "Account deleted",
        description: "Your account and all data have been removed.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Fixed Back Button Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md pt-safe"
      >
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-display text-primary text-center glow-pink">
            Edit Profile
          </h2>

          <div className="rounded-2xl gradient-fire p-[1px]">
            <div className="bg-card rounded-2xl p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                  <AvatarFallback>
                    <User className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Change Photo
                    </>
                  )}
                </Button>
                {avatarUrl && (
                  <p className="text-xs text-muted-foreground text-center">
                    Image uploaded! Click "Save Changes" to update your profile.
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Username
                </label>
                <Input
                  type="text"
                  placeholder="TrashPanda42"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="h-12 bg-muted border-border focus:border-primary rounded-xl"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Bio
                </label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  className="min-h-[120px] bg-muted border-border focus:border-primary rounded-xl resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/500
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="mt-8 rounded-2xl border border-red-500/30 p-6 space-y-4">
            <h3 className="text-lg font-display text-red-400">Danger Zone</h3>
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This will permanently delete your account and all your data including reviews, votes, and profile. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete My Account"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default EditProfile;
