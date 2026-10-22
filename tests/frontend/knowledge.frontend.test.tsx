/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import KnowledgeBasePage from "../../src/app/admin/knowledge-base/page";
import { useKnowledgeBase } from "../../src/lib/hooks/use-knowledge";
import { apiClient } from "../../src/lib/api";
import { LanguageProvider } from "../../src/components/LanguageProvider";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
  usePathname: () => "/admin/knowledge-base",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

jest.mock("../../src/lib/hooks/use-knowledge");
jest.mock("../../src/lib/api");

const renderComponent = () =>
  render(
    <LanguageProvider>
      <KnowledgeBasePage />
    </LanguageProvider>
  );

const mockedUseKnowledgeBase = useKnowledgeBase as jest.Mock;
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("KnowledgeBasePage Frontend Component (React Testing Library)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading indicator when data is fetching", () => {
    mockedUseKnowledgeBase.mockReturnValue({
      items: [],
      isLoading: true,
      error: null,
      mutate: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText("İşleniyor")).toBeInTheDocument();
  });

  it("should render empty state message when no items are available", () => {
    mockedUseKnowledgeBase.mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    renderComponent();
    expect(
      screen.getByText("Bu dönem için operasyonel veri bulunamadı")
    ).toBeInTheDocument();
  });

  it("should render list of knowledge base items", () => {
    mockedUseKnowledgeBase.mockReturnValue({
      items: [
        {
          id: "1",
          question: "Company Security Policy",
          answer: "All laptops must have full-disk encryption enabled.",
          isActive: true,
          createdAt: "2026-10-20T10:00:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText("Company Security Policy")).toBeInTheDocument();
    expect(
      screen.getByText("All laptops must have full-disk encryption enabled.")
    ).toBeInTheDocument();
  });

  it("should filter items dynamically when searching", () => {
    mockedUseKnowledgeBase.mockReturnValue({
      items: [
        {
          id: "1",
          question: "Alpha Guideline",
          answer: "Guidelines for Alpha.",
          isActive: true,
          createdAt: "2026-10-20T10:00:00.000Z",
        },
        {
          id: "2",
          question: "Beta Protocol",
          answer: "Protocol for Beta.",
          isActive: true,
          createdAt: "2026-10-20T10:00:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText("Alpha Guideline")).toBeInTheDocument();
    expect(screen.getByText("Beta Protocol")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Ara...");
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    expect(screen.getByText("Alpha Guideline")).toBeInTheDocument();
    expect(screen.queryByText("Beta Protocol")).not.toBeInTheDocument();
  });
});
