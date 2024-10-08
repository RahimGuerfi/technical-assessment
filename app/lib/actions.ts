"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { CreateAuditLog, TInvoiceStatus } from "./definitions";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid", "canceled", "overdue"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  oldStatus: TInvoiceStatus,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    // await sql`
    //   UPDATE invoices
    //   SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    //   WHERE id = ${id}
    // `;

    await Promise.all([
      await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `,
      createAuditLog({
        action_type: "change",
        invoice_id: id,
        old_status: oldStatus,
        new_status: status,
      }),
    ]);
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoiceStatusAndCreateAuditLog(
  data: CreateAuditLog
) {
  try {
    await Promise.all([
      updateInvoiceStatus(data.invoice_id, data.new_status),
      createAuditLog(data),
    ]);

    revalidatePath(`/dashboard/invoices/${data.invoice_id}/edit`);
  } catch (error) {
    return {
      message:
        "Database Error: Failed to update invoice status and create Audit log.",
    };
  }
}

export async function updateInvoiceStatus(id: string, status: TInvoiceStatus) {
  try {
    await sql`
      UPDATE invoices
      SET status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice Status." };
  }

  revalidatePath("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted Invoice" };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Invoice." };
  }
}

export async function cancelInvoice(id: string) {
  try {
    await sql`
      UPDATE invoices
      SET status = 'canceled'
      WHERE id = ${id}
    `;

    revalidatePath("/dashboard/invoices");
    return { message: "Canceled Invoice" };
  } catch (error) {
    return { message: "Database Error: Failed to Cancel Invoice." };
  }
}

export async function createAuditLog(data: CreateAuditLog) {
  const date = new Date().toISOString().split("T")[0];

  const session = await auth();

  if (!session?.user?.id) {
    return {
      message: "Could get logged in user id.",
    };
  }

  const userId = session?.user?.id;

  // Insert data into the database
  try {
    await sql`
      INSERT INTO audit_logs (user_id, invoice_id, old_status, new_status, action_type, date)
      VALUES (${userId}, ${data.invoice_id}, ${data.old_status}, ${data.new_status}, ${data.action_type}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Audit Log.",
    };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
