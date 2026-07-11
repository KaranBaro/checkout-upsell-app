const CREATE_BASIC_CODE_DISCOUNT = `
  mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_BASIC_CODE_DISCOUNT = `
  mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_FREE_SHIPPING_CODE_DISCOUNT = `
  mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
    discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
      codeDiscountNode {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_FREE_SHIPPING_CODE_DISCOUNT = `
  mutation discountCodeFreeShippingUpdate($id: ID!, $freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
    discountCodeFreeShippingUpdate(id: $id, freeShippingCodeDiscount: $freeShippingCodeDiscount) {
      codeDiscountNode {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DELETE_CODE_DISCOUNT = `
  mutation discountCodeDelete($id: ID!) {
    discountCodeDelete(id: $id) {
      deletedCodeDiscountId
      userErrors {
        field
        message
      }
    }
  }
`;

function toDateTime(date, time, fallbackNow = false) {
  if (!date) return fallbackNow ? new Date().toISOString() : null;
  return new Date(`${date}T${time || "00:00"}:00`).toISOString();
}

function buildMinimumRequirement(discount) {
  if (discount.minimumRequirement === "amount" && Number(discount.minimumPurchase || 0) > 0) {
    return {
      subtotal: {
        greaterThanOrEqualToSubtotal: String(Number(discount.minimumPurchase || 0)),
      },
    };
  }

  if (discount.minimumRequirement === "quantity" && Number(discount.minimumQuantity || 0) > 0) {
    return {
      quantity: {
        greaterThanOrEqualToQuantity: String(Number(discount.minimumQuantity || 0)),
      },
    };
  }

  return null;
}

function baseDiscountInput(discount) {
  const input = {
    title: discount.title || discount.code || "Checkout discount",
    code: String(discount.code || "").trim().toUpperCase(),
    startsAt: toDateTime(discount.startsAt, discount.startsTime, true),
    endsAt: discount.endsAt ? toDateTime(discount.endsAt, discount.endsTime) : null,
    customerSelection: { all: true },
    combinesWith: {
      orderDiscounts: Boolean(discount.combinesWith?.orderDiscounts),
      productDiscounts: Boolean(discount.combinesWith?.productDiscounts),
      shippingDiscounts: Boolean(discount.combinesWith?.shippingDiscounts),
    },
    appliesOncePerCustomer: Boolean(discount.oneUsePerCustomer),
  };

  if (discount.usageLimit) {
    input.usageLimit = Number(discount.usageLimit);
  }

  const minimumRequirement = buildMinimumRequirement(discount);
  if (minimumRequirement) {
    input.minimumRequirement = minimumRequirement;
  }

  return input;
}

function buildBasicDiscountInput(discount) {
  const isPercentage = discount.type === "Percentage";
  const value = isPercentage
    ? { percentage: Number(discount.value || 0) / 100 }
    : {
        discountAmount: {
          amount: String(Number(discount.value || 0)),
          appliesOnEachItem: discount.category === "Amount off products",
        },
      };

  return {
    ...baseDiscountInput(discount),
    customerGets: {
      value,
      items: { all: true },
    },
  };
}

function buildFreeShippingDiscountInput(discount) {
  return {
    ...baseDiscountInput(discount),
    destination: { all: true },
  };
}

async function runAdminGraphql(admin, query, variables, responseKey) {
  const response = await admin.graphql(query, { variables });
  const payload = await response.json();
  const result = payload.data?.[responseKey];
  const userErrors = result?.userErrors || payload.errors || [];

  if (userErrors.length) {
    const message = userErrors
      .map((error) => error.message || JSON.stringify(error))
      .join(", ");
    throw new Error(message);
  }

  return result;
}

export async function saveShopifyCodeDiscount(admin, discount) {
  if (!discount.code) {
    throw new Error("Discount code is required.");
  }

  const isFreeShipping = discount.category === "Free shipping" || discount.type === "Free shipping";
  const nextClass = isFreeShipping ? "freeShipping" : "basic";

  if (
    discount.shopifyDiscountId &&
    discount.shopifyDiscountClass &&
    discount.shopifyDiscountClass !== nextClass
  ) {
    await deleteShopifyCodeDiscount(admin, discount.shopifyDiscountId);
    discount = { ...discount, shopifyDiscountId: "" };
  }

  if (isFreeShipping) {
    const input = buildFreeShippingDiscountInput(discount);
    const result = discount.shopifyDiscountId
      ? await runAdminGraphql(
          admin,
          UPDATE_FREE_SHIPPING_CODE_DISCOUNT,
          { id: discount.shopifyDiscountId, freeShippingCodeDiscount: input },
          "discountCodeFreeShippingUpdate",
        )
      : await runAdminGraphql(
          admin,
          CREATE_FREE_SHIPPING_CODE_DISCOUNT,
          { freeShippingCodeDiscount: input },
          "discountCodeFreeShippingCreate",
        );

    return {
      shopifyDiscountId: result.codeDiscountNode?.id || discount.shopifyDiscountId,
      shopifyDiscountClass: nextClass,
    };
  }

  const input = buildBasicDiscountInput(discount);
  const result = discount.shopifyDiscountId
    ? await runAdminGraphql(
        admin,
        UPDATE_BASIC_CODE_DISCOUNT,
        { id: discount.shopifyDiscountId, basicCodeDiscount: input },
        "discountCodeBasicUpdate",
      )
    : await runAdminGraphql(
        admin,
        CREATE_BASIC_CODE_DISCOUNT,
        { basicCodeDiscount: input },
        "discountCodeBasicCreate",
      );

  return {
    shopifyDiscountId: result.codeDiscountNode?.id || discount.shopifyDiscountId,
    shopifyDiscountClass: nextClass,
  };
}

export async function deleteShopifyCodeDiscount(admin, id) {
  if (!id) return null;

  return runAdminGraphql(
    admin,
    DELETE_CODE_DISCOUNT,
    { id },
    "discountCodeDelete",
  );
}
