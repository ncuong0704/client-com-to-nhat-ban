import qs from "qs";
import { fetchAPI } from "@/utils/fetch-api";
import { getStrapiURL } from "@/utils/get-strapi-url";

const BASE_URL = getStrapiURL();

export async function getGlobalData(locale: string) {
  try {
    const path = '/api/global';
    const url = new URL(path, BASE_URL);

    url.search = qs.stringify(
      {
        populate: {
          header: {
            populate: {
              logo: {
                populate: {
                  fields: ["name", "subName"],
                  image: {
                    fields: ["url", "alternativeText"],
                  },
                },
              },
              menu: {
                populate: {
                  fields: ["name", "scrollTo"],
                },
              },
              cta: {
                populate: {
                  fields: ["name", "scrollTo"],
                },
              },
            },
          },
          footer: {
            populate: {
              fields: ["slogan", "title_contact", "title_social", "copyright"],
              logo: {
                populate: {
                  fields: ["name", "subName"],
                  image: {
                    fields: ["url", "alternativeText"],
                  },
                },
              },
              items_contact: {
                populate: {
                  fields: ["icon", "text"],
                },
              },
              items_social: {
                populate: {
                  fields: ["name", "logo", "url"],
                },
              },
            },
          },
        },
        locale,
      }
    )


    const result = await fetchAPI(url.href, {
      method: "GET",
      next: { revalidate: 300, tags: ["global-data", `global-data-${locale}`] }
    });
    return result;
  } catch (error) {
    const err = error as Error & { status?: number };
    const is5xx = err?.status != null && err.status >= 500 && err.status < 600;
    if (is5xx) {
      console.warn(`[getGlobalData] Backend ${err.status} cho locale ${locale}. Kiểm tra Strapi (Railway).`);
    } else {
      console.error(`Error fetching global data for locale ${locale}:`, error);
    }
    return null;
  }
}
export async function getLandingPageData(locale: string) {
  try {
    const path = '/api/landingpage';
    const url = new URL(path, BASE_URL);

    url.search = qs.stringify(
      {
        populate: {
          blocks: {
            on: {
              "layout.header": {
                populate: {
                  logo: {
                    populate: {
                      fields: ["name", "subName"],
                      image: {
                        fields: ["url", "alternativeText"],
                      },
                    },
                  },
                  menu: {
                    populate: {
                      fields: ["name", "scrollTo"],
                    },
                  },
                  cta: {
                    populate: {
                      fields: ["name", "scrollTo"],
                    },
                  },
                },
              },
              "layout.footer": {
                populate: {
                  fields: ["slogan", "title_contact", "title_social", "copyright"],
                  logo: {
                    populate: {
                      fields: ["name", "subName"],
                      image: {
                        fields: ["url", "alternativeText"],
                      },
                    },
                  },
                  items_contact: {
                    populate: {
                      fields: ["icon", "text"],
                    },
                  },
                  items_social: {
                    populate: {
                      fields: ["name", "logo", "url"],
                    },
                  },
                },
              },
              "sections.hero": {
                populate: {
                  fields: ["title", "description"],
                  background: {
                    fields: ["url", "alternativeText"],
                  },
                  cta: {
                    populate: {
                      fields: ["name", "scrollTo"],
                    },
                  },
                },
              },
              "sections.menu-section": {
                populate: {
                  fields: ["title", "description"],
                },
              },
              "sections.video-section": {
                populate: {
                  fields: ["title", "description"],
                },
              }
            },
          },
          seo: {
            populate: {
              metaImage: {
                fields: ["url", "alternativeText"],
              },
              openGraph: {
                populate: {
                  ogImage: {
                    fields: ["url", "alternativeText"],
                  },
                },
              },
            },
          },
        },
        locale,
      }
    )


    const result = await fetchAPI(url.href, {
      method: "GET",
      next: { revalidate: 300, tags: ["landing-page", `landing-page-${locale}`] }
    });
    return result;
  } catch (error) {
    const err = error as Error & { status?: number };
    const is5xx = err?.status != null && err.status >= 500 && err.status < 600;
    if (is5xx) {
      console.warn(`[getLandingPageData] Backend ${err.status} cho locale ${locale}, hiển thị Loading. Kiểm tra Strapi (Railway) có đang chạy.`);
    } else {
      console.error(`Error fetching landing page data for locale ${locale}:`, error);
    }
    return null;
  }
}

export async function getDishData(locale: string) {
  try {
    const path = '/api/dishes';
    const url = new URL(path, BASE_URL);

    url.search = qs.stringify(
      {
        populate: {
          fields: ["name", "description", "price", "sold", "likes", "soldOut"],
          image: {
            fields: ["url", "alternativeText"],
          },
          badges: true,
          category_dish: true,
          add: {
            on: {
              "elements.add-checkbox-list": {
                populate: {
                  fields: ["title"],
                  list: {
                    populate: {
                      fields: ["name", "price"],
                    },
                  },
                },
              },
              "elements.add-radio-list": {
                populate: {
                  fields: ["title"],
                  list: {
                    populate: {
                      fields: ["name", "price"],
                    },
                  },
                },
              },
            },
          }
        },
        locale,
        pagination: {
          page: 1,
          pageSize: 1000 // số lớn để lấy tất cả món
        }
      }
    )


    const result = await fetchAPI(url.href, {
      method: "GET",
      next: { revalidate: 60, tags: ["dish", `dish-${locale}`] }
    });
    return result;
  } catch (error) {
    const err = error as Error & { status?: number };
    const is5xx = err?.status != null && err.status >= 500 && err.status < 600;
    if (is5xx) {
      console.warn(`[getDishData] Backend ${err.status} cho locale ${locale}. Kiểm tra Strapi (Railway).`);
    } else {
      console.error(`Error fetching dish data for locale ${locale}:`, error);
    }
    return null;
  }
}
export async function getPaymentSettings() {
  try {
    const path = '/api/notification-setting';
    const url = new URL(path, BASE_URL);
    url.search = qs.stringify({
      populate: {
        bank_qr_image: { fields: ['url', 'alternativeText'] },
      },
      fields: ['bank_transfer_info'],
    });
    const result = await fetchAPI(url.href, {
      method: 'GET',
      next: { revalidate: 300, tags: ['payment-settings'] },
    });
    return result;
  } catch {
    return null;
  }
}

export async function getAddressData() {
  try {
    const path = '/api/addresses';
    const url = new URL(path, BASE_URL);
    url.search = qs.stringify({
      filters: { is_active: { $eq: true } },
      fields: ['name', 'address', 'phone'],
      sort: ['name:asc'],
    });
    const result = await fetchAPI(url.href, {
      method: 'GET',
      next: { revalidate: 3600, tags: ['address'] },
    });
    return result;
  } catch {
    return null;
  }
}

export async function getVideoData(locale: string) {
  try {
    const path = '/api/videos';
    const url = new URL(path, BASE_URL);

    url.search = qs.stringify(
      {
        populate: {
          fields: ["title", "description", "youtubeId"],
          category_video: true,
        },
        locale,
        pagination: {
          page: 1,
          pageSize: 1000 // số lớn để lấy tất cả video
        }
      }
    )


    const result = await fetchAPI(url.href, {
      method: "GET",
      next: { revalidate: 300, tags: ["video", `video-${locale}`] }
    });
    return result;
  } catch (error) {
    const err = error as Error & { status?: number };
    const is5xx = err?.status != null && err.status >= 500 && err.status < 600;
    if (is5xx) {
      console.warn(`[getVideoData] Backend ${err.status} cho locale ${locale}. Kiểm tra Strapi (Railway).`);
    } else {
      console.error(`Error fetching video data for locale ${locale}:`, error);
    }
    return null;
  }
}