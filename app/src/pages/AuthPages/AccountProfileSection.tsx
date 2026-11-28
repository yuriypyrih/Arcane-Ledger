import { Save, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { updateProfile } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextAreaInput from "../../components/CharactersPage/FormInputs/TextAreaInput";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import ExternalImage from "../../components/ExternalImage";
import { setAuthenticatedUser, showToast, useAppDispatch, useAppSelector } from "../../store";
import { getHttpsUrlValidationMessage } from "../../utils/httpsUrl";
import { getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

const BIO_MAX_LENGTH = 500;

/** The player's own avatar link and bio, shown to the GM and in the sidebar menu. */
function AccountProfileSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return null;
  }

  const trimmedAvatarUrl = avatarUrl.trim();
  const avatarError = getHttpsUrlValidationMessage(avatarUrl, "Avatar link");
  const hasChanges = trimmedAvatarUrl !== user.avatarUrl || bio.trim() !== user.bio;
  const canSave = hasChanges && !avatarError && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await updateProfile(
        { avatarUrl: trimmedAvatarUrl, bio: bio.trim() },
        { suppressFailureToast: true }
      );

      dispatch(setAuthenticatedUser(response.user));
      setAvatarUrl(response.user.avatarUrl);
      setBio(response.user.bio);
      dispatch(showToast({ text: "Profile saved.", type: "success" }));
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className={styles.accountSection} aria-labelledby="account-profile-title">
      <div className={styles.accountSectionTopline}>
        <div className={styles.accountSectionHeader}>
          <span className={styles.accountSectionIcon}>
            <UserRound size={20} aria-hidden="true" />
          </span>
          <div>
            <p className={styles.eyebrow}>Profile</p>
            <h2 id="account-profile-title" className={styles.accountSectionTitle}>
              Avatar and Bio
            </h2>
          </div>
        </div>
      </div>

      <form className={styles.profileForm} onSubmit={handleSubmit}>
        <div className={styles.profilePreviewRow}>
          <span className={styles.profilePreview}>
            <ExternalImage
              src={!avatarError ? trimmedAvatarUrl : ""}
              className={styles.profilePreviewImage}
              fallback={
                <span aria-hidden="true">{user.nickname.charAt(0).toUpperCase() || "?"}</span>
              }
            />
          </span>
          <label className={styles.profileField}>
            <span className={styles.label}>Avatar link</span>
            <TextInput
              className={styles.input}
              inputMode="url"
              invalid={Boolean(avatarError)}
              maxLength={500}
              placeholder="https://example.com/me.png"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
            />
            <span className={styles.profileHint}>
              A picture hosted elsewhere. Your GM and your party see it; the site loads it from that
              address.
            </span>
            {avatarError ? <span className={styles.profileError}>{avatarError}</span> : null}
          </label>
        </div>

        <label className={styles.profileField}>
          <span className={styles.label}>Bio</span>
          <TextAreaInput
            className={styles.input}
            maxLength={BIO_MAX_LENGTH}
            placeholder="A line or two about you as a player."
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
          <span className={styles.profileHint}>
            {bio.length}/{BIO_MAX_LENGTH}
          </span>
        </label>

        {error ? <p className={styles.profileError}>{error}</p> : null}

        <div className={styles.accountButtonRow}>
          <ActionButton
            type="submit"
            icon={<Save size={16} aria-hidden="true" />}
            fullWidth={false}
            disabled={!canSave}
            loading={isSaving}
          >
            Save Profile
          </ActionButton>
        </div>
      </form>
    </section>
  );
}

export default AccountProfileSection;
