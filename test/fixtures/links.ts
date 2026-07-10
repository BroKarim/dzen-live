export const mockLinks = [
  {
    id: "link-1",
    profileId: "profile-1",
    title: "My Portfolio",
    url: "https://example.com",
    position: 0,
    isActive: true,
    buttonColor: null,
    buttonTextColor: null,
    titleStyle: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "link-2",
    profileId: "profile-1",
    title: "GitHub",
    url: "https://github.com/testuser",
    position: 1,
    isActive: true,
    buttonColor: null,
    buttonTextColor: null,
    titleStyle: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockInvalidLinks = [
  { title: "", url: "" },
  { title: "No Protocol", url: "not-a-url" },
  { title: "x".repeat(101), url: "https://example.com" },
  { title: "Valid", url: "https://" + "a".repeat(2048) + ".com" },
];
