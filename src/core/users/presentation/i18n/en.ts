const dict = {
  nav: 'Profile',
  profile: {
    title: 'My Profile',
    subtitle: 'Manage your personal information',
    username: 'Username',
    usernamePlaceholder: 'your_username',
    usernameMin: 'At least 3 characters',
    usernameMax: 'At most 30 characters',
    firstName: 'First name',
    firstNamePlaceholder: 'John',
    lastName: 'Last name',
    lastNamePlaceholder: 'Doe',
    avatarUrl: 'Avatar URL',
    avatarUrlPlaceholder: 'https://...',
    bio: 'Bio',
    bioPlaceholder: 'Tell us a bit about yourself...',
    bioMax: 'At most 500 characters',
    locale: 'Locale',
    localePlaceholder: 'e.g. en-US',
    timezone: 'Timezone',
    timezonePlaceholder: 'e.g. America/New_York',
    save: 'Save changes',
    saving: 'Saving...',
    saveSuccess: 'Profile updated successfully',
    saveError: 'Could not update profile. Try again.',
    memberSince: 'Member since',
  },
} as const;

export default dict;
export type UsersDict = typeof dict;
