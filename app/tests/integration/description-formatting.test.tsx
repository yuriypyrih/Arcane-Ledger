import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DescriptionContent from "../../src/components/DescriptionContent/DescriptionContent";
import MonsterEntryRenderer from "../../src/components/MonsterEntryRenderer";
import { buildItemDetailPresentation } from "../../src/pages/ItemCodexEntryPage/itemPresentation";
import { sanitizeUserInput } from "../../src/utils/userInputSanitization";

const description = "First  line\n  Indented line\n\n\n    Second paragraph\nLast line";
const unsafeMarkup =
  '<script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">link</a>';

describe("formatted descriptions", () => {
  it("keeps multiline whitespace while retaining input sanitization", () => {
    expect(sanitizeUserInput(description, { multiline: true })).toBe(description);
    expect(sanitizeUserInput(`${description}\r\n\u0000${unsafeMarkup}`, { multiline: true })).toBe(
      `${description}\n${unsafeMarkup.replaceAll("<", "‹").replaceAll(">", "›")}`
    );
    expect(sanitizeUserInput("Two  words\nonly")).toBe("Two words only");
  });

  it("preserves item spacing, blank lines, and supported emphasis", () => {
    const text = `${description}\n**Bold** and _italic_`;
    const presentation = buildItemDetailPresentation({ id: "test-item", name: "Test", desc: text });
    const { container } = render(<DescriptionContent description={presentation.description} />);
    expect(container.querySelector("p")?.textContent).toBe(`${description}\nBold and italic`);
    expect(container.querySelector("strong")?.textContent).toBe("Bold");
    expect(container.querySelector("em")?.textContent).toBe("italic");
  });

  it("preserves creature description, trait, and action whitespace", () => {
    const { container } = render(
      <MonsterEntryRenderer
        monster={{
          key: "test-monster",
          name: "Test Creature",
          desc: description,
          traits: [{ name: "Trait", desc: description }],
          actions: [{ name: "Action", desc: description, action_type: "ACTION" }]
        }}
      />
    );
    expect(
      [...container.querySelectorAll("p")].filter((p) => p.textContent === description)
    ).toHaveLength(3);
  });

  it.each(["spell", "item", "creature"])(
    "never renders executable markup in %s descriptions",
    (kind) => {
      const { container } = render(
        kind === "creature" ? (
          <MonsterEntryRenderer monster={{ key: "unsafe", name: "Test", desc: unsafeMarkup }} />
        ) : (
          <DescriptionContent
            description={
              kind === "item"
                ? buildItemDetailPresentation({ id: "unsafe", name: "Test", desc: unsafeMarkup })
                    .description
                : [unsafeMarkup]
            }
          />
        )
      );
      expect(container.querySelector("script, img, iframe, a, [onerror]")).toBeNull();
      expect(container.textContent).toContain(unsafeMarkup);
    }
  );
});
