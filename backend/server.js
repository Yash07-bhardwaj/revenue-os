require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// RAZORPAY TEST MODE
// ========================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ========================================
// DEMO MERCHANT DATA
// ========================================

const merchantData = {
  merchant: "UrbanKart",

  revenue: 4260000,
  orders: 3842,
  customers: 2916,

  paymentSuccess: 91.8,

  failedPayments: 315,
  failedPaymentValue: 82400,

  abandonedCheckouts: 317,
  abandonedCheckoutValue: 182000,

  winBackCustomers: 428,
  winBackValue: 94000
};

// ========================================
// REVENUE AGENT
// ========================================

function revenueAgent(data) {

  const opportunities = [];

  // FAILED PAYMENTS
  const failedPaymentRate =
    (data.failedPayments / data.orders) * 100;

  if (failedPaymentRate > 5) {

    opportunities.push({
      type: "Failed Payment Recovery",
      potential: data.failedPaymentValue,
      confidence: 78,
      priority: "HIGH",

      reason:
        `${data.failedPayments} payments failed, representing ₹${data.failedPaymentValue.toLocaleString("en-IN")} in potential revenue.`,

      action:
        "Recover eligible failed payments"
    });
  }

  // ABANDONED CHECKOUT
  if (data.abandonedCheckouts > 100) {

    opportunities.push({
      type: "Abandoned Checkout",
      potential: data.abandonedCheckoutValue,
      confidence: 72,
      priority: "HIGH",

      reason:
        `${data.abandonedCheckouts} customers reached checkout but did not complete payment.`,

      action:
        "Generate payment recovery links"
    });
  }

  // CUSTOMER WIN-BACK
  if (data.winBackCustomers > 100) {

    opportunities.push({
      type: "Customer Win-back",
      potential: data.winBackValue,
      confidence: 61,
      priority: "MEDIUM",

      reason:
        `${data.winBackCustomers} previous customers have not purchased recently.`,

      action:
        "Create a targeted win-back campaign"
    });
  }

  // SORT BY CONFIDENCE
  opportunities.sort(
    (a, b) => b.confidence - a.confidence
  );

  const bestOpportunity = opportunities[0];

  return {

    agent: "RevenueOS Growth Agent",

    goal: "Find my next ₹1 lakh",

    merchant: data.merchant,

    totalPotential: opportunities.reduce(
      (sum, item) => sum + item.potential,
      0
    ),

    opportunities,

    recommendedAction: bestOpportunity
      ? {
          type: bestOpportunity.type,
          reason: bestOpportunity.reason,
          confidence: bestOpportunity.confidence,
          action: bestOpportunity.action
        }
      : null,

    status: "analysis_complete"
  };
}

// ========================================
// MERCHANT API
// ========================================

app.get("/api/merchant", (req, res) => {

  res.json(merchantData);

});

// ========================================
// AGENT API
// ========================================

app.post("/api/analyze", (req, res) => {

  const result = revenueAgent(merchantData);

  res.json(result);

});

// ========================================
// RAZORPAY RECOVERY LINK
// ========================================

app.post("/api/recovery-link", async (req, res) => {

  try {

    const amount = Number(req.body.amount) || 10000;

    const paymentLink =
      await razorpay.paymentLink.create({

        amount: amount,

        currency: "INR",

        description:
          "UrbanKart - Payment Recovery",

        customer: {
          name: "UrbanKart Customer"
        },

        notify: {
          sms: false,
          email: false
        },

        reminder_enable: true

      });

    res.json({

      success: true,

      message:
        "Recovery payment link generated",

      link: paymentLink.short_url,

      paymentLinkId: paymentLink.id,

      amount: amount,

      status: paymentLink.status

    });

  } catch (error) {

    console.error("Razorpay error:", error);

    res.status(500).json({

      success: false,

      error:
        error.error?.description ||
        error.message ||
        "Unable to create payment link"

    });

  }

});

// ========================================
// START SERVER
// ========================================

if (require.main === module) {
  app.listen(5050, () => {
    console.log(
      "🚀 RevenueOS Agent running on http://localhost:5050"
    );
  });
}

module.exports = app;