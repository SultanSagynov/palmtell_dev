"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { 
  Plus, 
  User, 
  Edit, 
  Trash2, 
  Calendar,
  Star,
  BookOpen,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getZodiacSign } from "@/lib/horoscope";

interface Profile {
  id: string;
  name: string;
  dob: string | null;
  avatarEmoji?: string | null;
  isDefault: boolean;
  _count: {
    readings: number;
  };
}

interface UserData {
  accessTier: string;
  profileLimit: number;
}

const EMOJI_OPTIONS = ["👤", "👨", "👩", "🧑", "👶", "👴", "👵", "🌟", "💫", "🌙", "☀️", "🌸", "🌺", "🌹", "🦋"];

export default function ProfilesPage() {
  const { user } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDob, setNewProfileDob] = useState("");
  const [newProfileEmoji, setNewProfileEmoji] = useState("👤");
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadUserData();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      const response = await fetch("/api/profiles");
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      setError("Failed to load profiles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/user/access");
      if (!response.ok) {
        throw new Error("Failed to load user data");
      }
      const data = await response.json();
      setUserData({
        accessTier: data.tier || data.accessTier || "trial",
        profileLimit: data.profileLimit || 1,
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileName.trim(),
          dob: newProfileDob || null,
          avatarEmoji: newProfileEmoji,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      await loadProfiles();
      setNewProfileName("");
      setNewProfileDob("");
      setNewProfileEmoji("👤");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create profile");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProfile = async () => {
    if (!editingProfile) return;

    try {
      const response = await fetch(`/api/profiles/${editingProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          dob: editDob || null,
          avatarEmoji: editEmoji,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      await loadProfiles();
      setEditingProfile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete profile");
      }

      await loadProfiles();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete profile");
    }
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditDob(profile.dob ? profile.dob.split('T')[0] : "");
    setEditEmoji(profile.avatarEmoji || "👤");
  };

  const getZodiacDisplay = (dob: string | null) => {
    if (!dob) return "Set DOB to unlock";
    try {
      const sign = getZodiacSign(new Date(dob));
      return sign.charAt(0).toUpperCase() + sign.slice(1);
    } catch {
      return "Invalid date";
    }
  };

  const canAddProfile = userData && profiles.length < userData.profileLimit;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Profiles</h1>
          <p className="mt-1 text-muted-foreground">
            Manage profiles for yourself and loved ones. Each profile gets its
            own readings, horoscope, and insights.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!canAddProfile}>
              <Plus className="h-4 w-4" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Enter profile name"
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth (Optional)</Label>
                <Input
                  id="dob"
                  type="date"
                  value={newProfileDob}
                  onChange={(e) => setNewProfileDob(e.target.value)}
                />
              </div>
              <div>
                <Label>Avatar Emoji</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewProfileEmoji(emoji)}
                      className={`p-2 rounded border ${
                        newProfileEmoji === emoji ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim() || isCreating}
                className="w-full gap-2"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isCreating ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profile limit info */}
      {userData && (
        <Card className="border-border/40 bg-muted/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">
                  {profiles.length} of {userData.profileLimit === Infinity ? "∞" : userData.profileLimit} profiles used
                </strong>
                {userData.accessTier === "trial" && " (Upgrade to Pro for 3 profiles)"}
              </p>
              {!canAddProfile && userData.profileLimit !== Infinity && (
                <Badge variant="outline">Limit Reached</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profiles list */}
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-lg">
                    {profile.avatarEmoji || <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{profile.name}</CardTitle>
                    {profile.isDefault && (
                      <p className="text-xs text-muted-foreground">Default profile</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.isDefault && <Badge variant="secondary">Default</Badge>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!profile.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium">
                      {profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Readings</p>
                    <p className="text-sm font-medium">{profile._count.readings}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Zodiac Sign</p>
                    <p className="text-sm font-medium">{getZodiacDisplay(profile.dob)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter profile name"
                />
              </div>
              <div>
                <Label htmlFor="edit-dob">Date of Birth</Label>
                <Input
                  id="edit-dob"
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                />
              </div>
              <div>
                <Label>Avatar Emoji</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setEditEmoji(emoji)}
                      className={`p-2 rounded border ${
                        editEmoji === emoji ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleEditProfile} className="w-full">
                Update Profile
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Info tip */}
      <Card className="border-border/40 bg-muted/20">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Add a date of
            birth to unlock horoscope and lucky numbers for each profile.
            {userData?.accessTier === "trial" && " Upgrade to Pro to create up to 3 profiles and read palms for your loved ones."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
