import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetCurrentUserQuery } from "@/store/backend-api-slices/auth";
import { useUpdateCurrentUserMutation } from "@/store/backend-api-slices/users";
import { parseRTKQError } from "@/store/util";
import {
    userUpdateRequestSchema,
} from "@/types/backend/requests/users";
import {
    userUpdateFormSchema,
    type UserUpdateForm,
} from "@/types/pages/user-profile";
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

/** Form for updating user data. */
export const UserForm = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const [updateCurrentUser, { isLoading, isSuccess }] =
        useUpdateCurrentUserMutation();

    const form = useForm<UserUpdateForm>({
        resolver: zodResolver(userUpdateFormSchema),
        values: {
            username: currentUser!.username,
            newPassword: "",
            newPasswordRepeat: "",
            currentPassword: "",
        },
    });

    const onSubmit = async (data: UserUpdateForm) => {
        const body = userUpdateRequestSchema.parse({
            username: data.username,
            password: data.newPassword || undefined,
            current_user_password: data.currentPassword,
        });

        try {
            await updateCurrentUser({ userId: currentUser!.id, body }).unwrap();
            form.setValue("currentPassword", "");
            form.setValue("newPassword", "");
            form.setValue("newPasswordRepeat", "");
        } catch (err) {
            const parsed = parseRTKQError(err);
            if (parsed.status === 400) {
                form.setError("root", {
                    message: "Incorrect current password.",
                });
                form.setValue("currentPassword", "");
            } else if (parsed.status === 409) {
                form.setError("root", {
                    message: "Username is unavailable.",
                });
            } else {
                form.setError("root", {
                    message: "Failed to update user data.",
                });
            }
        }
    };

    const rootError = form.formState.errors.root?.message;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                {isSuccess ? (
                    <p className="text-sm text-success">
                        Profile updated.
                    </p>
                ) : null}
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
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="password"
                                    autoComplete="new-password"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPasswordRepeat"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Repeat New Password</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="password"
                                    autoComplete="new-password"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="password"
                                    autoComplete="off"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
};
