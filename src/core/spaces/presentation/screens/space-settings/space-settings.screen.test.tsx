import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SpaceSettingsScreen } from "./space-settings.screen";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

vi.mock("@/shared/presentation/components/screen-header/screen-header", () => ({
  ScreenHeader: ({ title }: { title: string }) => (
    <div data-testid="screen-header" data-title={title} />
  ),
}));

vi.mock(
  "@/core/spaces/presentation/components/space-members-list/space-members-list.component",
  () => ({
    SpaceMembersList: () => <div data-testid="space-members-list" />,
  }),
);

vi.mock(
  "@/core/spaces/presentation/components/space-weather-widget/space-weather-widget.component",
  () => ({
    SpaceWeatherWidget: () => <div data-testid="space-weather-widget" />,
  }),
);

const mockResetInv = vi.fn();
const mockResetAdd = vi.fn();
const mockResetRemove = vi.fn();
const mockResetGeo = vi.fn();

vi.mock(
  "@/core/spaces/presentation/hooks/use-space-settings/useSpaceSettings.hook",
  () => ({
    useSpaceSettings: vi.fn(),
  }),
);

import { useSpaceSettings } from "@/core/spaces/presentation/hooks/use-space-settings/useSpaceSettings.hook";
import { addMemberSchema } from "@/core/spaces/presentation/schemas/add-member.schema";
import { createInvitationSchema } from "@/core/spaces/presentation/schemas/create-invitation.schema";
import {
  updateGeolocationSchema,
  type UpdateGeolocationFormValues,
} from "@/core/spaces/presentation/schemas/update-geolocation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";

const mockUseSpaceSettings = vi.mocked(useSpaceSettings);

function makeDefaultHookReturn(
  overrides: Partial<ReturnType<typeof useSpaceSettings>> = {},
): ReturnType<typeof useSpaceSettings> {
  const { result: invFormResult } = renderHook(() =>
    useForm({
      resolver: zodResolver(createInvitationSchema),
      defaultValues: { role: "member" as const },
    }),
  );
  const { result: addFormResult } = renderHook(() =>
    useForm({ resolver: zodResolver(addMemberSchema) }),
  );
  const { result: removeFormResult } = renderHook(() =>
    useForm({ resolver: zodResolver(addMemberSchema) }),
  );
  const { result: geoFormResult } = renderHook(() =>
    useForm<UpdateGeolocationFormValues>({
      resolver: zodResolver(updateGeolocationSchema),
      defaultValues: { latitude: null, longitude: null, environment: null },
    }),
  );

  return {
    spaceDetail: {
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
    isOwner: false,
    copied: null,
    copy: vi.fn(),
    inviteLink: vi.fn((inv) => `http://localhost/en/invite?code=${inv.code}`),
    invForm: invFormResult.current,
    addForm: addFormResult.current,
    removeForm: removeFormResult.current,
    geoForm: geoFormResult.current,
    onCreateInvitation: vi.fn(),
    onAddMember: vi.fn(),
    onRemoveMember: vi.fn(),
    onUpdateGeolocation: vi.fn(),
    createInvitation: {
      isPending: false,
      error: null,
      data: undefined,
      reset: mockResetInv,
    } as unknown as ReturnType<typeof useSpaceSettings>["createInvitation"],
    addMember: {
      isPending: false,
      error: null,
      isSuccess: false,
      reset: mockResetAdd,
    } as unknown as ReturnType<typeof useSpaceSettings>["addMember"],
    removeMember: {
      isPending: false,
      error: null,
      isSuccess: false,
      reset: mockResetRemove,
    } as unknown as ReturnType<typeof useSpaceSettings>["removeMember"],
    updateGeolocation: {
      isPending: false,
      error: null,
      isSuccess: false,
      reset: mockResetGeo,
    } as unknown as ReturnType<typeof useSpaceSettings>["updateGeolocation"],
    ...overrides,
  };
}

const memberListDict = {
  loading: "Loading members...",
  empty: "No members yet.",
} as const;

const weatherDict = {
  title: "Weather",
  forecast: "7-day forecast",
  temperatureUnit: "°C",
  precipitationUnit: "mm",
  setLocationForWeather: "Set a location in space settings to see the weather forecast.",
  loading: "Loading weather...",
  error: "Could not load weather data. Please try again later.",
  noData: "No weather data available for this location.",
} as const;

const dict = {
  title: "Space settings",
  details: {
    title: "Space details",
    name: "Name",
    owner: "Owner",
    createdAt: "Created",
  },
  geolocation: {
    title: "Location",
    hint: "Set the coordinates and environment type to enable the weather forecast.",
    latitudeLabel: "Latitude",
    latitudePlaceholder: "e.g. 40.4168",
    longitudeLabel: "Longitude",
    longitudePlaceholder: "e.g. -3.7038",
    environmentLabel: "Environment",
    environmentIndoor: "Indoor",
    environmentOutdoor: "Outdoor",
    environmentMixed: "Mixed",
    environmentNone: "None",
    save: "Save location",
    saving: "Saving...",
    saveSuccess: "Location saved successfully.",
    saveError: "Could not save location. Try again.",
  },
  invitation: {
    title: "Create invitation",
    roleLabel: "Role",
    roleMember: "Member",
    roleOwner: "Owner",
    expiresLabel: "Expires at (optional)",
    submit: "Generate invitation",
    submitting: "Generating...",
    code: "Code",
    copyCode: "Copy code",
    copyLink: "Copy invite link",
    codeCopied: "Code copied!",
    linkCopied: "Link copied!",
    qrAlt: "QR code for space invitation",
    qrHint: "Share this QR or the code above to invite someone",
  },
  members: {
    title: "Members",
    addTitle: "Add member",
    addUserId: "User ID",
    addUserIdPlaceholder: "Paste UUID here",
    addSubmit: "Add",
    addSubmitting: "Adding...",
    addSuccess: "Member added successfully",
    removeTitle: "Remove member",
    removeUserId: "User ID",
    removeUserIdPlaceholder: "Paste UUID here",
    removeSubmit: "Remove",
    removeSubmitting: "Removing...",
    removeSuccess: "Member removed successfully",
    confirmRemove: "Are you sure you want to remove this member?",
  },
  errors: {
    loadFailed: "Could not load space details. Try again.",
    invitationFailed: "Could not create the invitation. Try again.",
    addFailed: "Could not add the member. Try again.",
    removeFailed: "Could not remove the member. Try again.",
  },
} as const;

describe("SpaceSettingsScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ScreenHeader with the settings title", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        spaceDetail: {
          data: undefined,
          isLoading: true,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    const header = screen.getByTestId("screen-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("data-title", "Space settings");
  });

  it("shows loading skeleton when isLoading is true", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        spaceDetail: {
          data: undefined,
          isLoading: true,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    const { container } = render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("shows error alert when isError is true", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        spaceDetail: {
          data: undefined,
          isLoading: false,
          isError: true,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.getByText(dict.errors.loadFailed)).toBeInTheDocument();
  });

  it("renders space details when data is loaded", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "other-user-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.getByTestId("space-name")).toHaveTextContent("My Space");
    expect(screen.getByTestId("space-owner")).toHaveTextContent(
      "other-user-id",
    );
    expect(screen.getByTestId("space-created-at")).toBeInTheDocument();
  });

  it("hides invitation card for non-owner", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: false,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "other-user-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.queryByTestId("invitation-submit")).not.toBeInTheDocument();
  });

  it("shows invitation card for owner", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: true,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "user-owner-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.getByTestId("invitation-submit")).toBeInTheDocument();
    expect(screen.getByTestId("invitation-role-select")).toBeInTheDocument();
    expect(screen.getByTestId("invitation-expires-input")).toBeInTheDocument();
  });

  it("shows add/remove member forms for owner", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: true,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "user-owner-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.getByTestId("add-member-input")).toBeInTheDocument();
    expect(screen.getByTestId("add-member-submit")).toBeInTheDocument();
    expect(screen.getByTestId("remove-member-input")).toBeInTheDocument();
    expect(screen.getByTestId("remove-member-submit")).toBeInTheDocument();
  });

  it("hides add/remove member forms for non-owner", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: false,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "other-user-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.queryByTestId("add-member-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("remove-member-input")).not.toBeInTheDocument();
  });

  it("renders SpaceMembersList in members section", () => {
    mockUseSpaceSettings.mockReturnValue(makeDefaultHookReturn());

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.getByTestId("space-members-list")).toBeInTheDocument();
  });

  it("shows invitation result with displayCode and copy buttons", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: true,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "user-owner-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
        createInvitation: {
          isPending: false,
          error: null,
          data: {
            id: "inv-1",
            displayCode: "ABC-123",
            code: "raw-code-abc123",
            qrId: null,
            expiresAt: "2024-12-31T23:59:59Z",
            role: "MEMBER",
            spaceId: "space-123",
          },
          reset: mockResetInv,
        } as unknown as ReturnType<typeof useSpaceSettings>["createInvitation"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.getByTestId("invitation-result")).toBeInTheDocument();
    expect(screen.getByTestId("invitation-display-code")).toHaveTextContent(
      "ABC-123",
    );
    expect(screen.getByTestId("copy-code-btn")).toBeInTheDocument();
    expect(screen.getByTestId("copy-link-btn")).toBeInTheDocument();
  });

  it("shows QR image with alt text when invitation has qrId", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: true,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "user-owner-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
        createInvitation: {
          isPending: false,
          error: null,
          data: {
            id: "inv-1",
            displayCode: "ABC-123",
            code: "raw-code-abc123",
            qrId: "qr-uuid-456",
            expiresAt: "2024-12-31T23:59:59Z",
            role: "MEMBER",
            spaceId: "space-123",
          },
          reset: mockResetInv,
        } as unknown as ReturnType<typeof useSpaceSettings>["createInvitation"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    const qrImg = screen.getByTestId("invitation-qr");
    expect(qrImg).toBeInTheDocument();
    expect(qrImg).toHaveAttribute("src", "/api/qrs/qr-uuid-456/image");
    expect(qrImg).toHaveAttribute("alt", dict.invitation.qrAlt);
  });

  it("shows geolocation form for owner", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: true,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "user-owner-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.getByTestId("geolocation-latitude-input")).toBeInTheDocument();
    expect(screen.getByTestId("geolocation-longitude-input")).toBeInTheDocument();
    expect(screen.getByTestId("geolocation-save-submit")).toBeInTheDocument();
  });

  it("hides geolocation form for non-owner", () => {
    mockUseSpaceSettings.mockReturnValue(
      makeDefaultHookReturn({
        isOwner: false,
        spaceDetail: {
          data: {
            id: "space-123",
            name: "My Space",
            ownerId: "other-user-id",
            createdAt: "2024-01-15T10:00:00Z",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof useSpaceSettings>["spaceDetail"],
      }),
    );

    render(<SpaceSettingsScreen dict={dict} weatherDict={weatherDict} memberListDict={memberListDict} lang="en" />);
    expect(screen.queryByTestId("geolocation-save-submit")).not.toBeInTheDocument();
  });
});
