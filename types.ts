export interface ImageProps {
    url: string;
    alternativeText: string;
}
export interface LinkProps {
    name: string;
    scrollTo: string;
}
export interface IconAndTextProps {
    icon: string;
    text: string;
}
export interface SocialProps {
    name: string;
    logo: string;
    url: string;
}
export interface LogoProps {
    name: string;
    subName: string;
    image: ImageProps;
}
type ComponentType =
    | "layout.header"
    | "layout.footer"
    | "sections.hero"
    | "sections.menu-section"
    | "sections.video-section"

interface Base<T extends ComponentType, D extends object = Record<string, unknown>> {
    id: number;
    __component?: T;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    publishedBy?: string;
    data?: D;
}

export type Section =
    | HeroProps
    | MenuSectionProps
    | VideoSectionProps

export interface HeaderProps extends Base<"layout.header">{
    logo: LogoProps;
    menu: LinkProps[];
    cta: LinkProps;
}

export interface FooterProps extends Base<"layout.footer">{
    logo: LogoProps;
    slogan: string;
    title_contact: string;
    items_contact: IconAndTextProps[];
    title_social: string;
    items_social: SocialProps[];
    copyright: string;
}

export interface HeroProps extends Base<"sections.hero">{
    background: ImageProps;
    title: string;
    description: string;
    cta: LinkProps;
}

export interface MenuSectionProps extends Base<"sections.menu-section">{
    title: string;
    description: string;
}

export interface VideoSectionProps extends Base<"sections.video-section">{
    title: string;
    description: string;
}
