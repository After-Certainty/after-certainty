import { EditorialSection } from "@/components/about/editorial-section";

export function AboutVision() {
  return (
    <EditorialSection id="evolving-conversation" heading="An Evolving Conversation" className="border-t border-border/25">
      <p>The project is intentionally designed to remain open-ended.</p>
      <p>Over time it may expand through:</p>
      <ul className="list-none space-y-3 border-l border-accent/22 pl-6 text-[17px] leading-relaxed md:text-lg">
        <li>additional books</li>
        <li>collaborative essays</li>
        <li>podcast conversations</li>
        <li>contributor participation</li>
        <li>shared pattern libraries</li>
        <li>open publishing infrastructure</li>
        <li>community discussions</li>
      </ul>
      <p>The goal is not to create a closed framework, but a durable space for thoughtful exploration.</p>
    </EditorialSection>
  );
}
