import { Section } from "@/types";
import { HeroSection } from "./hero-section";
import { MenuSection } from "./menu-section";
import { VideoSection } from "./video-section";

function sectionRenderer(section: Section, index: number, locale: string, searchParams?: any) {
    switch (section.__component) {
        case "sections.hero":
            return <HeroSection key={index} hero={section} />;
        case "sections.menu-section":
            return <MenuSection key={index} menu={section} locale={locale} />;
        case "sections.video-section":
            return <VideoSection key={index} video={section} locale={locale} />;
        default:
            console.warn(`Unknown section component: ${section.__component}`);
            return null;
    }
}

export function SectionRenderer({ sections, locale, searchParams }: { sections: Section[], locale: string, searchParams?: any }) {
    return sections.map((section, index) => sectionRenderer(section, index, locale, searchParams));
}