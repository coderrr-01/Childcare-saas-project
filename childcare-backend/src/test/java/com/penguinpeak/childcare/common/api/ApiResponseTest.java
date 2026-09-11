package com.penguinpeak.childcare.common.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ApiResponseTest {
    @Test
    void supportsSuccessfulAndNullData() {
        ApiResponse<String> response = ApiResponse.success("child", ApiMeta.request("request-123"));
        assertThat(response.data()).isEqualTo("child");
        assertThat(ApiResponse.success(null, ApiMeta.request("request-123")).data()).isNull();
    }

    @Test
    void retainsMetadataWithoutPagination() {
        ApiResponse<String> response = ApiResponse.success("value", ApiMeta.request("request-123"));
        assertThat(response.meta().requestId()).isEqualTo("request-123");
        assertThat(response.meta().pagination()).isNull();
    }
}
