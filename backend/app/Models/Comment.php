<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'procedure_name',
        'author',
        'body',
        'tags',
        'mentions',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'tags'       => 'array',
        'mentions'   => 'array',
    ];
}
