import { EditorialSection } from "@/components/about/editorial-section";

export function AboutVision() {
  return (
    <EditorialSection id="evolving-conversation" heading="An Evolving Conversation" className="border-t border-border/25">
      <p>The project is intentionally open-ended.</p>
      <p>Over time it may grow through:</p>
      <ul className="list-none space-y-3 border-l border-accent/22 pl-6 text-[17px] leading-relaxed md:text-lg">
        <li>additional books</li>
        <li>collaborative essays</li>
        <li>podcast conversations</li>
        <li>contributor participation</li>
        <li>shared pattern libraries</li>
        <li>open publishing tools and workflows</li>
        <li>community discussions</li>
      </ul>
      <p>
        The aim is not a closed framework, but a durable place for thoughtful exploration—one that
        can widen as more people bring what they see.
      </p>
    </EditorialSection>
  );
}
