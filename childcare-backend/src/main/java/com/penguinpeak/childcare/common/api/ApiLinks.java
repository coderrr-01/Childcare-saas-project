package com.penguinpeak.childcare.common.api;

import java.util.Map;

/** Optional future-proof container for navigational links; not populated by the foundation. */
public record ApiLinks(Map<String, String> links) {

    public ApiLinks {
        links = Map.copyOf(links);
    }
}
