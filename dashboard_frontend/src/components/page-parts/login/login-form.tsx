import { useLoginMutation } from "@/store/backend-api-slices/auth";
import { loginRequestSchema, type LoginRequest } from "@/types/backend/requests/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseRTKQError } from "@/store/util";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/common/shadcn-ui/form";
import { Input } from "@/components/common/shadcn-ui/input";
import { Button } from "@/components/common/shadcn-ui/button";

export const LoginForm = () => {
    const [login, { isLoading }] = useLoginMutation();

    const form = useForm<LoginRequest>({
        resolver: zodResolver(loginRequestSchema),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit = async (data: LoginRequest) => {
        try {
            await login(data).unwrap();
        } catch (err) {
            const parsed = parseRTKQError(err);
            form.setError("root", {
                message:
                    parsed.status === 401
                        ? "Invalid credentials."
                        : "Failed to log in.",
            });
        }
    };

    const rootError = form.formState.errors.root?.message;

    return (
        <div className="mx-auto mt-16 max-w-sm">
            <h1 className="mb-6 text-2xl font-semibold">Login</h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                >
                    {rootError ? (
                        <p className="text-sm font-medium text-destructive">
                            {rootError}
                        </p>
                    ) : null}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input {...field} autoFocus />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
