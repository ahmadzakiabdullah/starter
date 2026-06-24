<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TestSmtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-system') ?? false;
    }

    public function rules(): array
    {
        return [
            'mail_driver' => ['required', 'in:log,smtp'],
            'mail_host' => ['nullable', 'required_if:mail_driver,smtp', 'string'],
            'mail_port' => ['nullable', 'required_if:mail_driver,smtp', 'integer', 'min:1', 'max:65535'],
            'mail_username' => ['nullable', 'string'],
            'mail_password' => ['nullable', 'string'],
            'mail_encryption' => ['required', 'in:none,ssl,tls'],
            'mail_from_address' => ['required', 'email'],
            'mail_from_name' => ['required', 'string'],
        ];
    }
}
