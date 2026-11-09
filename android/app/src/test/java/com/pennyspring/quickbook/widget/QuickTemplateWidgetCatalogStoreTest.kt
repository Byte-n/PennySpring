package com.pennyspring.quickbook.widget

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class QuickTemplateWidgetCatalogStoreTest {
    @Test
    fun `parses local book with templates`() {
        val catalog =
            QuickTemplateWidgetCatalogStore.parseCatalog(
                """
                {
                  "version": 12,
                  "book": {
                    "kind": "local",
                    "serverUrl": "",
                    "booksId": 1,
                    "bookName": "日常账本",
                    "available": true,
                    "unavailableReason": "",
                    "templates": [
                      { "id": 3, "name": "早餐" },
                      { "id": 4, "name": "还信用卡" },
                      { "id": 0, "name": "无效" },
                      { "id": 5, "name": "  " }
                    ]
                  }
                }
                """.trimIndent(),
            )

        assertEquals(12L, catalog?.version)
        assertEquals("日常账本", catalog?.book?.ref?.bookName)
        assertTrue(catalog?.book?.available == true)
        assertEquals(2, catalog?.book?.templates?.size)
        assertEquals(
            "早餐",
            catalog
                ?.book
                ?.templates
                ?.get(0)
                ?.name,
        )
        assertEquals(
            "还信用卡",
            catalog
                ?.book
                ?.templates
                ?.get(1)
                ?.name,
        )
    }

    @Test
    fun `parses remote book with server url`() {
        val catalog =
            QuickTemplateWidgetCatalogStore.parseCatalog(
                """
                {
                  "version": 2,
                  "book": {
                    "kind": "remote",
                    "serverUrl": "https://example.com",
                    "booksId": 9,
                    "bookName": "工作账本",
                    "available": false,
                    "unavailableReason": "服务器访问令牌未配置",
                    "templates": []
                  }
                }
                """.trimIndent(),
            )

        assertEquals("https://example.com", catalog?.book?.ref?.serverUrl)
        assertEquals("服务器访问令牌未配置", catalog?.book?.unavailableReason)
        assertTrue(catalog?.book?.templates?.isEmpty() == true)
    }

    @Test
    fun `parses no book snapshot`() {
        val catalog =
            QuickTemplateWidgetCatalogStore.parseCatalog(
                """{"version": 3, "book": null}""",
            )

        assertEquals(3L, catalog?.version)
        assertNull(catalog?.book)
    }

    @Test
    fun `rejects missing version`() {
        assertNull(
            QuickTemplateWidgetCatalogStore.parseCatalog(
                """{"book": null}""",
            ),
        )
    }

    @Test
    fun `rejects remote book without server url`() {
        assertNull(
            QuickTemplateWidgetCatalogStore.parseCatalog(
                """
                {
                  "version": 1,
                  "book": {
                    "kind": "remote",
                    "serverUrl": "",
                    "booksId": 2,
                    "bookName": "工作账本",
                    "available": true,
                    "unavailableReason": "",
                    "templates": []
                  }
                }
                """.trimIndent(),
            ),
        )
    }
}
